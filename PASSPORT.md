# Add Passport to an app (instructions for Claude)

Darren says in an app's chat: **"Add Passport ID from Passport-ID"**.
Follow these steps. Don't redesign the login: same steps in every app, only the look changes.

Master copy: https://github.com/DF-AI-Lab/Passport-ID (branch with the latest version)

---

## 1. Copy the files (don't edit them in the app)

```
passport/
  config.js      ← same Google client ID in every app
  google.js      ← Google sign-in + Drive
  passport.js    ← passcode, backup codes, lockout, fingerprint
  ui.js          ← the screens
  passport.css   ← shared layout
  theme.json     ← THIS app's look (the only file you write)
  PASSPORT.md    ← this file, plus the version line below
```

Add at the bottom of the app's `passport/PASSPORT.md`:
`This app has Passport v0.2. Update from DF-AI-Lab/Passport-ID.`

---

## 2. Make theme.json

Copy `themes/bare.json` and fill in from the app's current look:
logo, name, tagline, colours, font, button text, Drive folder name.
Ready-made: `themes/wmm.json`, `themes/ft.json`, `themes/tasknotes.json`.

---

## 3. Load it (in this order)

```html
<link rel="stylesheet" href="passport/passport.css">
<script src="passport/config.js"></script>
<script src="passport/google.js"></script>
<script src="passport/passport.js"></script>
<script src="passport/ui.js"></script>
```

```js
fetch('passport/theme.json').then((r) => r.json()).then((theme) =>
  PassportUI.start({
    app: 'wmm',                 // short app name: wmm / ft / tasknotes
    theme,
    mount: document.getElementById('login'),
    onUnlocked: (passport) => showApp(passport), // hide login, show the app
  }));
```

- Settings page: show **"Your passport: " + passport.id**
- Lock button: `Passport.setUnlocked('wmm', false); location.reload();`
- Passport settings screen: `PassportUI.settings()`

---

## 4. Saving app data to Drive

```js
const folderId = await PassportCloud.appFolder(passport.id, theme.drive);
// = App data - DON'T DELETE / DF123456 / WMM
```

Save **all** the app's files inside that folder. Nothing loose in My Drive.
If the app already has files elsewhere in Drive, move them in here.

---

## Rules

- Never change the `passport/` files inside an app. Changes go in Passport-ID, then copy.
- All apps use the **same client ID**, or they can't see the same passport.
- Add the app's web address to the Google client ID (see SETUP.md) if it's not on `df-ai-lab.github.io`.
- API keys stay in the app's Cloudflare Worker. Never in Drive or the page.
- If the app must break a rule, write why in `passport-id.md` under "Differences".
