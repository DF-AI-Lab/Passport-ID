# App Passport (one ID for all Darren's apps)

One place for: who you are, how you sign in, where things are saved, where secrets live.
Every app follows this. If an app is different, write why under "Differences".

---

## 1. The idea (Darren, 1 Nov 2026)

- One **ID** (e.g. `DF123456`) = your passport
- Sign up to any app → the ID fills in your details
- **Same login** on every app: username + 6-digit passcode
- **10 backup codes** to get back in if locked out
- **Same lock screen** on every app
- Drive folder per ID, with one folder per app inside

---

## 2. Three places (each has one job)

| Place | Holds | Why |
|---|---|---|
| **Firebase** (one project for all apps) | Your ID, login, backup codes (scrambled) | Built for logins, Google keeps it safe |
| **Cloudflare Worker secrets** | API keys (Claude etc.) | Keys never reach the phone or Drive |
| **Google Drive** `DF123456/` | App data + backups | Easy to see, free, already used by WMM |

**Rule:** secrets never go in Drive. Data never goes in the Worker.

---

## 3. Drive folders

```
DF123456/
  WMM/
  FT/
  Todo/
```

---

## 4. Sign in (same on every app)

1. Username + 6-digit passcode
2. Firebase checks it (passcode stored scrambled, never plain)
3. Locked out → use 1 of 10 backup codes (each works once)
4. Same lock screen design on every app (shared code, copied in)

---

## 5. Safety rules

- No API keys in Drive, in the page, or in GitHub
- No DOB in the ID (not needed)
- No real personal data in public repos
- Passcodes + backup codes stored scrambled only
- Firebase rules: only your ID can read your data

---

## 6. Firebase or encrypt everything in Drive?

**Choice: Firebase for login + Worker for keys.** Not "encrypt it all in Drive".

- Encrypting Drive yourself = you hold the key. Lose it → lose everything.
- Home-made security is easy to get wrong.
- Firebase is used by millions of apps and is free at our size.
- FT already uses Firebase + a Worker, so it's proven for us.

---

## 7. Apps

| App | Login now | Data now | Moves to passport? |
|---|---|---|---|
| WMM | none | phone + Drive backup | yes |
| FT (Food-Tracker) | Firebase | Firestore | yes (closest already) |
| Todo / Notes | ? | ? | yes |

## Differences (write here if an app breaks a rule, and why)

- (none yet)

---

## Open questions

- ID format: `DF` + 6 numbers?
- Username: email or a nickname?
- Which repo is the Todo/Notes app?
- Just Darren's apps, or other people too (family, friends)?

## Change log

- 1 Nov 2026: first version (written in app-assistant)
- 1 Nov 2026: moved here to its own repo
