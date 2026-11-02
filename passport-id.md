# App Passport (one ID for all apps)

One place for: who you are, how you sign in, where things are saved.
Every app follows this. If an app is different, write why under "Differences".

---

## 1. The idea

- One **ID** (e.g. `DF123456`) = your passport
- Just for **Darren** (each person's passport would sit in their own Drive anyway)
- **Same sign-in** on every app: Google + 6-digit passcode
- **10 backup codes** to get back in if locked out
- **Same login steps** on every app, but each app keeps **its own look**
- Drive folder per ID, with one folder per app inside

Why: stop re-explaining sign-in to every app. Build it once, copy it everywhere.

---

## 2. Two places (each has one job)

| Place | Holds | Why |
|---|---|---|
| **Google Drive** `App data - DON'T DELETE/DF123456/` | `passport.json` (ID, name, email, scrambled passcode + backup codes) and app data | Yours, free, protected by your Google login |
| **GitHub** (this repo) | Shared Passport code + instructions | One master copy |

**No Firebase.** An app that needs it for its own stuff (like FT) keeps its own.

**API keys are out of scope.** They stay in each app's Cloudflare Worker, as now.

**Rules:** no API keys in Drive. Passcodes only ever **scrambled**. Drive holds data, never code.

The phone keeps a copy of the passport, so the lock screen is fast and works offline.

---

## 3. Drive folders

Everything sits in **one** top folder:

```
App data - DON'T DELETE/
  DF123456/
    passport.json   ← the passport
    WMM/
    FT/
    Todo/
```

Use the Google account that has your Drive and Sheets.

---

## 4. Sign in (same steps on every app)

**First time (any app):**
1. Sign in with Google (this picks the account and the Drive)
2. Type full name + make a 6-digit passcode
3. Save your 10 backup codes
4. "Turn on fingerprint?" → Yes (optional)

**Every time after:** lock screen → fingerprint 👆, or type the 6-digit passcode.

**Fingerprint (built into Passport, not each app):**
- Uses the phone's own fingerprint / face unlock (passkeys / WebAuthn)
- The fingerprint never leaves the phone; the app only gets "yes, it's them"
- Linked to one phone + one app's web address, so turn it on once per app, per phone
- Passcode always works as the fallback

**Second app / new phone:** sign in with Google, Passport finds `passport.json` in Drive, "Welcome back". No sign-up again.

**Locked out:**
1. Forgot passcode → use 1 of 10 backup codes (each works once)
2. No backup codes left → **Reset with Google** (sign in again with the same Google account, make a new passcode)

---

## 5. Look: same steps, own theme

Every login screen has the same parts:

- **App section** (each app fills this in): logo, app name, tagline
- Welcome back + first name (the ID stays hidden: it links apps behind the scenes)
- 6-digit passcode (or fingerprint button)
- "Forgot? Use a backup code"
- Main button (each app writes its own text)
- "Saves to Drive: DF123456 / app"
- "Use another Google account"

Each app's **Settings** page shows: "Your passport: DF123456".

Each app has a `theme.json` holding its logo, colours, font and button text.

| App | Colours | Logo | Button |
|---|---|---|---|
| WMM | dark green, teal button | £ magnifier | Open my money |
| FT | black, mint | fridge | Open my fridge |
| TaskNotes | navy, blue | "TN" | Open my notes |

Mock: https://claude.ai/artifact/CA6YdkBh7zcfVAgyzxiZRW

---

## 6. How an app gets Passport

This repo is the **master copy**. Never delete it.

In an app, say: **"Add Passport ID from Passport-ID"**. Claude follows [PASSPORT.md](PASSPORT.md) and adds:

```
passport/
  passport.js     ← shared code, copied from here
  theme.json      ← this app's logo + colours
  PASSPORT.md     ← "this app uses Passport vX, update from passport-id"
```

Each app keeps its **own copy**, so it doesn't need this repo to run.

---

## 7. Updates (choice: copy + version number, one chat)

- This repo has a version: **v1, v2 …**
- Each app records which version it has in `PASSPORT.md`
- One Claude chat with all app repos added. Darren says: **"update Passport in all apps"**
- Claude copies the new version into each app repo and pushes
- The apps run on **GitHub Pages**, so the push makes them live. No bot needed.
- Why copy, not a live link: each app is updated on purpose, so one bad change doesn't silently hit every app.

---

## 8. Safety rules

- No API keys in Drive, in the page, or in GitHub
- No DOB in the ID (not needed)
- No real personal data in public repos
- Passcodes + backup codes stored scrambled only
- **Lock for 5 minutes after 5 wrong passcode tries** (makes a short code safe)
- Google login is the real lock. The passcode guards the screen on your phone.
- Passport only gets `drive.file`: it sees the files it made, nothing else in Drive

---

## 9. Why Drive, not Firebase

- It's just Darren, so no shared server is needed
- Google sign-in already protects Drive
- One less thing to set up, pay for or keep safe
- Trade-off: the 5-tries lock is per phone (Google login still guards Drive)

One-time setup: a Google client ID. See [SETUP.md](SETUP.md).

How an app adds it: [PASSPORT.md](PASSPORT.md).

---

## 10. Apps

| App | Login now | Data now | Moves to passport? |
|---|---|---|---|
| WMM | first name + passcode | phone + Drive backup | yes |
| FT (Food-Tracker) | Google (Firebase) | Firestore | yes (closest already) |
| TaskNotes (Todo / Notes) | first name | ? | yes |

## Differences (write here if an app breaks a rule, and why)

- (none yet)

---

## Open questions

- ID format: `DF` + 6 numbers? (`DF` for everyone, or each person's initials?)
- Which repo is TaskNotes?

## Decided

- Just Darren, passport lives in Drive, no Firebase
- Google accounts: **df.ai.lab.hq@gmail.com = demos/testing**, **darrenfawcett1980@gmail.com = real use**. Each gets its own passport.
- ONE Google key for every app (project "Wheres My Money Lite"), so all apps see the same Drive files
- Google sign-in links everything (no separate username)
- API keys out of scope (stay in Cloudflare)
- Each app keeps its own look; login steps are the same
- Updates: copy + version number, pushed from one chat (apps run on GitHub Pages)
- Fingerprint login is part of Passport (every app gets it the same way)

## Change log

- 1 Nov 2026: first version (written in app-assistant)
- 1 Nov 2026: moved here to its own repo
- 1 Nov 2026: Google sign-in, open to anyone, per-app themes, how apps get it, updates
- 1 Nov 2026: fingerprint login added
- 1 Nov 2026: ID hidden on login, shown in Settings only
- 2 Nov 2026: Drive instead of Firebase, just Darren, Reset with Google, v0.2 built
- 2 Nov 2026: switched to WMM's Google key, so every app shares one key
- 2 Nov 2026: one top folder "App data - DON'T DELETE" holds the ID folder and all app data
