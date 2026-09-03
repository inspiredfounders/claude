# Shipping Inspired Club to the App Store & Google Play

This covers everything from here to "live in both stores." Steps split into
**what I (Claude) can do in this repo** vs. **what only you can do**, since
store submission requires accounts, payments, and signing credentials that
can't be created by an AI agent.

## 1. Accounts you need to create (can't be automated)

| What | Cost | Notes |
|---|---|---|
| Apple Developer Program | $99/year | **Done.** |
| Google Play Console | $25 one-time | **Done.** |

~~A Mac (or cloud Mac)~~ **Solved** — GitHub Actions now builds and signs
both apps for you, no Mac needed. See section 3.

## 2. What's already done in this repo

- `apps/mobile` — the member-facing app (React/Vite, ported from your Figma
  Make file) with Capacitor added as a dependency and `capacitor.config.ts`
  configured (app id `com.inspiredfounders.club`, name "Inspired Club").
- `apps/dashboard` — the admin + mentor web dashboard.
- `supabase/migrations` — full database schema, including the new `mentor`
  role and mentor tables.

## 3. Generating and shipping the native iOS/Android builds

This is now automated via GitHub Actions — no Mac, no Xcode, no Android
Studio required on your end. Four workflows live in `.github/workflows/`:

| Workflow | Runs | What it does |
|---|---|---|
| `ios-build.yml` | every push to `main` touching `apps/mobile`, plus PRs | Compiles the iOS app for the simulator (unsigned). Proves the native wrapper still builds. No secrets needed — already active. |
| `android-build.yml` | same as above | Same idea for Android — an unsigned debug APK. Already active. |
| `ios-release.yml` | manual only (Actions tab → "Run workflow") | Archives, signs, and uploads to TestFlight, using an App Store Connect API key so there's no certificate/provisioning-profile file wrangling. |
| `android-release.yml` | manual only | Builds a signed release AAB and uploads it to a Play Console track (internal by default) via a service account. |

The two `*-release.yml` workflows need secrets added once, under this
repo's **Settings → Secrets and variables → Actions**:

**For `ios-release.yml`:**
- `APPLE_TEAM_ID` — developer.apple.com → Membership.
- `APPSTORE_ISSUER_ID` and `APPSTORE_KEY_ID` — App Store Connect → Users
  and Access → Keys → generate a new key.
- `APPSTORE_PRIVATE_KEY` — the `.p8` file's full contents (Apple only lets
  you download it once when you generate the key — save it somewhere safe
  immediately).

**For `android-release.yml`:**
- `ANDROID_KEYSTORE_BASE64` — a release keystore you generate once with
  `keytool -genkeypair`, base64-encoded (`base64 -i my-release.keystore`).
  **Back the original file up somewhere safe** — losing it means you can
  never update this app's listing again.
- `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`
  — set when you generate the keystore.
- `PLAY_SERVICE_ACCOUNT_JSON` — Play Console → Users and permissions →
  Invite new users → "Service account", grant it Release Manager access to
  this app, then generate a JSON key for it in Google Cloud Console.

Add secrets as you get each credential — the release workflows simply
won't run correctly until theirs are all in place. Ping me once they're
set and I'll trigger a run.

## 4. App icons & splash screens

Capacitor needs a 1024×1024 source icon and a splash image. Once you have
your real logo files (see "Known gaps" below), generate all required sizes
with:

```bash
npm install -D @capacitor/assets
npx capacitor-assets generate
```

## 5. Push notifications on native platforms

The Figma Make prototype used web push (VAPID keys + a service worker),
which works in a browser but not inside a native iOS/Android shell. The
client side of native push is now wired up:

- `supabase/migrations/008_native_push_tokens.sql` adds a `device_push_tokens`
  table (separate from the web-only `push_subscriptions`) storing each
  device's platform + token.
- `apps/mobile/src/lib/nativePush.ts` requests permission, registers with
  `@capacitor/push-notifications`, and saves the resulting token to that
  table. It's wired into the existing `pushNotifications.ts` functions
  (`requestPermissionAndSubscribe`, `unsubscribe`, `updateNotifyHour`), so
  the same "Enable Daily Inspiration" UI in `NotificationsPanel.tsx` works
  on both web and native without changes — it just calls whichever path is
  relevant for the current platform.

**Still needed from you** — the server side that actually *sends* to those
tokens requires real credentials I don't have:

- **iOS**: an APNs Auth Key (`.p8`) from your Apple Developer account, and
  push notifications capability enabled in Xcode.
- **Android**: a Firebase project with Cloud Messaging enabled, and the
  `google-services.json` file dropped into `apps/mobile/android/app/`.

Once you have those, the `daily-notify` Supabase Edge Function needs a
second code path added (alongside its existing web-push branch) that reads
from `device_push_tokens` and sends via Firebase Admin (Android) / APNs
HTTP/2 with a signed JWT (iOS) instead of `web-push`. Flag it to me with the
credentials in place (as Supabase secrets, not pasted in chat) and I'll wire
that half up too.

## 6. Supabase production checklist

- Create the three storage buckets the app expects: `avatars`, `covers`,
  `vault-files` (Supabase Dashboard → Storage), with appropriate public/
  private access rules.
- Run all files in `supabase/migrations/` against your Supabase project
  (via the SQL Editor, or `supabase db push` with the Supabase CLI).
- Create your first admin account: sign up normally through the app, then
  in the Supabase Dashboard's Table Editor, set that user's `profiles.role`
  to `admin`. There's intentionally no in-app way to self-promote to admin.
- Review Row Level Security policies in `001_initial_schema.sql` and
  `005_mentors.sql` before going live — they're written to be safe by
  default, but worth a second pair of eyes given they gate a paid
  membership product.

## 7. Store listing requirements (both stores)

You'll need to prepare, independent of code:

- **Privacy Policy URL** — mandatory for both stores since the app collects
  accounts, profiles, and usage data. A first draft is now in
  `legal/PRIVACY_POLICY.md`, based on exactly what the current schema and
  code collect — it needs a lawyer's review and the bracketed placeholders
  (legal entity name, contact details, hosting-region confirmation) filled
  in before you host it at a public URL and link it in both stores' listings.
- **Terms of Service** — recommended, not always mandatory. A first draft
  is in `legal/TERMS_OF_SERVICE.md`, same caveat: lawyer review required,
  especially Section 4 (Membership and billing) — see the payments note in
  §9 below before finalizing it.
- **Screenshots** — per required device sizes (iPhone 6.7", 6.5", iPad if
  supporting tablets; Android phone + tablet).
- **App description, keywords, category, support email/URL, age rating
  questionnaire** (both stores ask about user-generated content, which
  "Club" posts/comments will trigger — answer honestly, it just affects the
  age rating).
- **Apple**: App Privacy "nutrition label" declaring exactly what data is
  collected (email, name, etc.) — must match what the app actually does.

## 8. Beta testing before public release (recommended)

- **iOS**: upload a build to TestFlight, invite yourself/team/a few real
  members before public release.
- **Android**: use Google Play's Internal Testing track the same way.

## 9. Known gaps to close before submitting

- ~~Placeholder logo assets~~ **Done.** All three real brand files are now
  in `apps/mobile/src/imports/`: `InspiredFounders_PrimaryLogo_Black.svg`,
  `InspiredFounders_PrimaryLogo_White.svg`,
  `InspiredFounders_PrimaryLogo_Colour.svg` (used on the app's opening/home
  screen), and the real `InspiredFounders_NorthStarIcon_White.png`.
- Native push notifications (section 5) — the client-side registration and
  token storage are now wired up; only the server-side sending (Firebase
  Admin / APNs credentials) is still outstanding, per section 5 above.
- Review and fill in the "Mentors" and "Community" content moderation
  workflows via the new admin dashboard before opening the app to real
  members.
- **In-app purchase compliance**: the Settings/Membership screen currently
  shows *mock* billing UI (a hardcoded "Visa ending 4242", fake renewal
  date) — no real payment processor is wired in yet. Before this ships as
  a paid membership app: Apple and Google both require digital
  subscriptions purchased *inside* an iOS/Android app to go through their
  own in-app purchase systems (StoreKit / Google Play Billing) — a plain
  Stripe/website checkout embedded in the native app will get the app
  rejected. Decide your billing approach (native IAP for mobile, and/or a
  web-based signup flow that side-steps IAP by not selling from within the
  app, which both stores allow under certain conditions) before building
  this out, and flag it to me when you're ready — this is a real design
  decision, not just implementation, so it's worth deciding deliberately
  rather than defaulting into it.

## Typical review timelines

- **Apple**: usually 24–48 hours per submission, can be longer for a first
  submission or if flagged for manual review.
- **Google**: usually a few hours to 2 days, first-time developer accounts
  can face an extended review period (Google has been requiring closed
  testing periods for new accounts before granting production access to
  certain app categories — check your account's current requirements in
  the Play Console when you get there).
