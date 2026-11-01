# Passport ID

One ID + one login for all apps.

- The plan: [passport-id.md](passport-id.md)
- The demo: `index.html` (pretend data, no Firebase yet). Switch apps with the bar at the top.

## Files

```
passport/
  passport.js   ← core: passcode, backup codes, lockout, fingerprint
  ui.js         ← the screens (same steps on every app)
  passport.css  ← shared layout
themes/
  wmm.json  ft.json  tasknotes.json  bare.json   ← each app's logo + colours
```

Version: **0.1-demo**
