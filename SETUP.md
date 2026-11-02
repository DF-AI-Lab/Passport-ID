# One-time setup: Google key (about 5 minutes)

Passport needs one **Google client ID**. It lets the apps open Google sign-in and save to your Drive.

- Make it **once**. Every app uses the same one.
- It is **not a secret**, so it's safe in a public repo.

---

## Steps

1. Go to **console.cloud.google.com**
2. Top bar → **New project** → name it `Passport` → Create
3. Menu → **APIs & Services → Library** → search **Google Drive API** → **Enable**
4. Menu → **APIs & Services → OAuth consent screen** (or "Google Auth Platform")
   - App name: `Passport`
   - User type: **External**
   - Your email for support + contact
   - **Audience → Test users → add your Gmail**
5. Menu → **Credentials → Create credentials → OAuth client ID**
   - Type: **Web application**
   - **Authorised JavaScript origins**: `https://df-ai-lab.github.io`
     (add any other app web address here too)
6. Copy the **Client ID** (ends in `.apps.googleusercontent.com`)
7. Paste it to Claude. It goes in `passport/config.js`.

---

## Good to know

- Leave the app in **Testing**. Fine for just you, no Google review needed.
- Passport asks for `drive.file` only: it sees **only the files it made**, never the rest of your Drive.
- Google may say "Google hasn't verified this app". That's normal in Testing: tap **Continue**.
