# Gmail Dashboard

A small local dashboard that shows unread + flagged (starred) inbox mail from
three Gmail accounts side by side, with one-click **Archive** and **Label**
actions per email:

- hello@inspiredfounders.com.au
- priscilla@priscillaanncreative.com.au
- hello@priscilla-ann.com

It's a plain Node/Express server (`server.js`) that talks to the Gmail API,
plus a static HTML/JS frontend (`public/`) — no build step, no framework.
Gmail access tokens are stored locally in `data/tokens.json` (gitignored) and
never leave your machine.

---

## 1. Create the Google OAuth app

You need one OAuth client that all three accounts will authorize
individually (each account goes through its own "Connect" button and its own
Google sign-in). Do this once:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and
   create a new project (or pick an existing one you're happy to use for
   this) — top-left project dropdown → **New Project**.
2. **Enable the Gmail API**: in the left sidebar go to **APIs & Services →
   Library**, search for "Gmail API", open it, click **Enable**.
3. **Configure the OAuth consent screen**: **APIs & Services → OAuth
   consent screen**.
   - User type: **External** (unless all three inboxes live on one Google
     Workspace org you administer, in which case **Internal** is simpler
     and skips the token-expiry caveat in step 5 below).
   - App name: anything, e.g. "Gmail Dashboard". Support email: your own.
   - Scopes: click **Add or Remove Scopes** and add
     `https://www.googleapis.com/auth/gmail.modify` (covers reading,
     archiving, and labeling — no need to add anything else).
   - Test users: add all three addresses you're connecting:
     `hello@inspiredfounders.com.au`, `priscilla@priscillaanncreative.com.au`,
     `hello@priscilla-ann.com`. (If you chose Internal, skip this — anyone
     in your Workspace org can already sign in.)
4. **Create the OAuth client**: **APIs & Services → Credentials → Create
   Credentials → OAuth client ID**.
   - Application type: **Web application**.
   - Name: anything, e.g. "Gmail Dashboard local".
   - Authorized redirect URIs: add
     `http://localhost:8787/auth/callback` (matches the default
     `GOOGLE_REDIRECT_URI` below — change both together if you use a
     different port or host).
   - Click **Create**, then copy the **Client ID** and **Client secret**.
5. **Note on token expiry**: while the app is in **Testing** publishing
   status (the default, and fine for personal use with the 3 test users
   above), Google expires refresh tokens after 7 days — you'll just need to
   click "Connect" again for an account when that happens. To avoid it,
   either use **Internal** user type (Workspace org only, no expiry, no
   verification needed) or submit the app for Google's verification process
   to move it to **Production** (not necessary for personal use).

## 2. Configure the app

```bash
cd apps/gmail-dashboard
npm install
cp .env.example .env
```

Edit `.env` and fill in:

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from step 1.4 above.
- `SESSION_SECRET` — any random string (e.g.
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
- Leave `GOOGLE_REDIRECT_URI` and `PORT` as-is unless you changed the
  redirect URI in Google Cloud Console.

## 3. Run it

```bash
npm start
```

Open <http://localhost:8787>. You'll see three columns, one per account,
each with a **Connect** button. Click it, sign in with the matching Google
account, and approve access — since the app is unverified you'll see a
warning screen; click **Advanced → Go to Gmail Dashboard (unsafe)** to
proceed (this is expected for a personal-use app with test users you added
yourself).

Once connected, each column auto-loads unread + starred inbox emails, newest
first. Per email:

- **Archive** removes it from the inbox (Gmail's `INBOX` label) — this is
  exactly the same as the archive button in Gmail.
- **Label** applies a Gmail label by name, creating it first if it doesn't
  already exist.

Click **Refresh** in the top bar to reload all accounts.

## Notes

- If you disconnect an account, use `POST /api/accounts/:key/disconnect` or
  just delete its entry from `data/tokens.json` and reconnect.
- To run this somewhere other than your own machine, set `DASHBOARD_PASSWORD`
  in `.env` to require HTTP basic auth in front of the whole dashboard —
  otherwise anyone who can reach the port can read/archive/label your mail.
- The three accounts are hardcoded in `lib/accounts.js` — edit that file if
  you ever need to add, remove, or rename one.
