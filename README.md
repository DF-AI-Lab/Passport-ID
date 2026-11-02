# Passport ID

One ID + one login for all of Darren's apps. The passport lives in your Google Drive.

- The plan: [passport-id.md](passport-id.md)
- One-time Google setup: [SETUP.md](SETUP.md)
- How an app adds Passport: [PASSPORT.md](PASSPORT.md)
- Demo: https://df-ai-lab.github.io/Passport-ID/

No client ID in `passport/config.js` = pretend mode (this phone only).

## Files

```
passport/
  config.js     ← Google client ID (same in every app)
  google.js     ← Google sign-in + Drive
  passport.js   ← passcode, backup codes, lockout, fingerprint
  ui.js         ← the screens (same steps on every app)
  passport.css  ← shared layout
themes/
  wmm.json  ft.json  tasknotes.json  bare.json   ← each app's look
```

Version: **0.2**
