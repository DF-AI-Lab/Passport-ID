// Passport — core logic (no screens here; see ui.js).
// DEMO VERSION: data is kept in this browser (localStorage) as pretend data.
// The real version swaps the storage + lockout for Firebase (server side).

const Passport = (() => {
  const VERSION = '0.1-demo';
  const KEY = 'passport-demo-v1';
  const MAX_TRIES = 5;          // wrong passcodes before lock
  const LOCK_MS = 30 * 1000;    // demo: 30 seconds. Real: longer, enforced by server.
  const ITER = 100000;          // PBKDF2 rounds (scrambling strength)

  // ---------- storage ----------
  const blank = () => ({ passports: {}, apps: {} });
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || blank(); } catch { return blank(); }
  }
  function save(db) {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* private mode etc. */ }
  }

  // ---------- scrambling (never store plain codes) ----------
  const enc = new TextEncoder();
  const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  const randHex = (n) => hex(crypto.getRandomValues(new Uint8Array(n)));
  async function scramble(salt, text) {
    const key = await crypto.subtle.importKey('raw', enc.encode(text), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: enc.encode(salt), iterations: ITER, hash: 'SHA-256' }, key, 256);
    return hex(bits);
  }
  const randDigits = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b % 10).join('');

  // ---------- helpers ----------
  const norm = (email) => String(email || '').trim().toLowerCase();
  const isPasscode = (c) => /^\d{6}$/.test(String(c));

  function newId(db) {
    let id;
    do { id = 'DF' + randDigits(6); } while (Object.values(db.passports).some((p) => p.id === id));
    return id;
  }

  async function makeBackupCodes(salt) {
    const codes = Array.from({ length: 10 }, () => randDigits(4) + '-' + randDigits(4));
    const hashes = await Promise.all(codes.map((c) => scramble(salt, 'backup:' + c)));
    return { codes, stored: hashes.map((h) => ({ h, used: false })) };
  }

  // ---------- passports ----------
  function find(email) { return load().passports[norm(email)] || null; }

  async function create({ email, name, passcode }) {
    const db = load();
    const e = norm(email);
    if (db.passports[e]) throw new Error('A passport already exists for this account.');
    if (!isPasscode(passcode)) throw new Error('Passcode must be 6 numbers.');
    const salt = randHex(16);
    const { codes, stored } = await makeBackupCodes(salt);
    db.passports[e] = {
      id: newId(db), name: String(name).trim(), email: e, salt,
      pass: await scramble(salt, 'pass:' + passcode),
      backup: stored, fails: 0, lockUntil: 0, fingerprints: {},
      created: new Date().toISOString(),
    };
    save(db);
    return { passport: db.passports[e], codes };
  }

  function lockedFor(email) {
    const p = find(email);
    return p ? Math.max(0, p.lockUntil - Date.now()) : 0;
  }

  function recordFail(db, p) {
    p.fails += 1;
    if (p.fails >= MAX_TRIES) { p.lockUntil = Date.now() + LOCK_MS; p.fails = 0; }
    save(db);
    return { ok: false, triesLeft: p.lockUntil > Date.now() ? 0 : MAX_TRIES - p.fails, lockedMs: Math.max(0, p.lockUntil - Date.now()) };
  }

  // returns { ok } or { ok:false, triesLeft, lockedMs }
  async function checkPasscode(email, passcode) {
    const db = load(); const p = db.passports[norm(email)];
    if (!p) return { ok: false, triesLeft: 0, lockedMs: 0 };
    if (p.lockUntil > Date.now()) return { ok: false, triesLeft: 0, lockedMs: p.lockUntil - Date.now() };
    if (isPasscode(passcode) && (await scramble(p.salt, 'pass:' + passcode)) === p.pass) {
      p.fails = 0; save(db); return { ok: true };
    }
    return recordFail(db, p);
  }

  // a backup code works once
  async function useBackupCode(email, code) {
    const db = load(); const p = db.passports[norm(email)];
    if (!p) return { ok: false, triesLeft: 0, lockedMs: 0 };
    if (p.lockUntil > Date.now()) return { ok: false, triesLeft: 0, lockedMs: p.lockUntil - Date.now() };
    const clean = String(code).replace(/\D/g, '');
    if (clean.length === 8) {
      const h = await scramble(p.salt, 'backup:' + clean.slice(0, 4) + '-' + clean.slice(4));
      const hit = p.backup.find((b) => !b.used && b.h === h);
      if (hit) { hit.used = true; p.fails = 0; save(db); return { ok: true, left: backupLeft(p) }; }
    }
    return recordFail(db, p);
  }

  const backupLeft = (p) => p.backup.filter((b) => !b.used).length;

  async function setPasscode(email, passcode) {
    if (!isPasscode(passcode)) throw new Error('Passcode must be 6 numbers.');
    const db = load(); const p = db.passports[norm(email)];
    p.pass = await scramble(p.salt, 'pass:' + passcode);
    save(db);
  }

  async function newBackupCodes(email) {
    const db = load(); const p = db.passports[norm(email)];
    const { codes, stored } = await makeBackupCodes(p.salt);
    p.backup = stored; save(db);
    return codes;
  }

  // ---------- which Google account each app is signed in with ----------
  function appAccount(app) { return load().apps[app]?.email || null; }
  function setAppAccount(app, email) {
    const db = load();
    db.apps[app] = { ...(db.apps[app] || {}), email: norm(email) };
    save(db);
  }
  function signOut(app) { const db = load(); delete db.apps[app]; save(db); }
  function appPref(app, k) { return load().apps[app]?.[k]; }
  function setAppPref(app, k, v) { const db = load(); db.apps[app] = { ...(db.apps[app] || {}), [k]: v }; save(db); }

  // unlocked = this tab only, until closed or "Lock now"
  const unlockKey = (app) => 'passport-unlocked-' + app;
  function isUnlocked(app) { try { return sessionStorage.getItem(unlockKey(app)) === '1'; } catch { return false; } }
  function setUnlocked(app, on) { try { on ? sessionStorage.setItem(unlockKey(app), '1') : sessionStorage.removeItem(unlockKey(app)); } catch {} }

  // ---------- fingerprint (passkeys / WebAuthn) ----------
  // The fingerprint never leaves the phone. Linked to this phone + this web address.
  // DEMO: we only check the phone said "yes". Real version: server verifies the signature.
  const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const unb64 = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

  async function fingerprintAvailable() {
    try {
      return !!(window.PublicKeyCredential &&
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable());
    } catch { return false; }
  }

  async function enrollFingerprint(email, app, appName) {
    const p = find(email);
    const cred = await navigator.credentials.create({ publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: { name: appName },
      user: { id: enc.encode(p.id), name: p.email, displayName: p.name },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
      authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'preferred' },
      timeout: 60000,
    } });
    const db = load();
    db.passports[p.email].fingerprints[app] = b64(cred.rawId);
    save(db);
  }

  async function verifyFingerprint(email, app) {
    const id = find(email)?.fingerprints?.[app];
    if (!id) return false;
    const got = await navigator.credentials.get({ publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      allowCredentials: [{ type: 'public-key', id: unb64(id) }],
      userVerification: 'required', timeout: 60000,
    } });
    return !!got;
  }

  function removeFingerprint(email, app) {
    const db = load(); const p = db.passports[norm(email)];
    if (p) { delete p.fingerprints[app]; save(db); }
  }

  function resetAll() {
    try { localStorage.removeItem(KEY); sessionStorage.clear(); } catch {}
  }

  return {
    VERSION, MAX_TRIES, find, create, lockedFor, checkPasscode, useBackupCode, backupLeft,
    setPasscode, newBackupCodes, appAccount, setAppAccount, signOut, appPref, setAppPref,
    isUnlocked, setUnlocked, fingerprintAvailable, enrollFingerprint, verifyFingerprint,
    removeFingerprint, resetAll, isPasscode,
  };
})();
