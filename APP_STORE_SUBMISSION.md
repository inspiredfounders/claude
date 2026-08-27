# Shipping Inspired Club to the App Store & Google Play

This covers everything from here to "live in both stores." Steps split into
**what I (Claude) can do in this repo** vs. **what only you can do**, since
store submission requires accounts, payments, and signing credentials that
can't be created by an AI agent.

## 1. Accounts you need to create (can't be automated)

| What | Cost | Notes |
|---|---|---|
| Apple Developer Program | $99/year | Required to publish on the App Store. Enroll as yourself or as "Inspired Founders" (an Organization enrollment needs a D-U-N-S number — start that early, it can take a few days). |
| Google Play Console | $25 one-time | Required to publish on Google Play. |
| A Mac (or cloud Mac) | — | Building and signing the iOS app requires Xcode, which only runs on macOS. If you don't own a Mac, use a cloud CI service that provides macOS runners — Codemagic, Bitrise, or GitHub Actions' `macos-latest` runner all work with Capacitor projects. |

## 2. What's already done in this repo

- `apps/mobile` — the member-facing app (React/Vite, ported from your Figma
  Make file) with Capacitor added as a dependency and `capacitor.config.ts`
  configured (app id `com.inspiredfounders.club`, name "Inspired Club").
- `apps/dashboard` — the admin + mentor web dashboard.
- `supabase/migrations` — full database schema, including the new `mentor`
  role and mentor tables.

## 3. Generating the native iOS/Android projects

These commands need to run on a machine with the mobile toolchains installed
(they won't run in this sandbox — no Xcode/Android SDK here):

```bash
cd apps/mobile
npm install
npm run build            # produces dist/
npx cap add ios          # generates the ios/ Xcode project
npx cap add android       # generates the android/ Android Studio project
npx cap sync              # copies web build + plugins into both native projects
npx cap open ios          # opens Xcode
npx cap open android      # opens Android Studio
```

From there, iOS: set your Team/signing in Xcode, archive, and upload via
Xcode Organizer or Transporter. Android: build a signed AAB via Android
Studio's Build > Generate Signed Bundle, using a keystore you create and
**back up somewhere safe** (losing it means you can never update the app
under the same listing again).

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

- **Placeholder logo assets**: the Figma Make export didn't include your
  actual "Inspired Founders" logo files (`InspiredFounders_NorthStarIcon_White.png`,
  `InspiredFounders_PrimaryLogo_Black.png`, `InspiredFounders_PrimaryLogo_White.png`).
  Placeholder versions were generated so the app builds, but these **must**
  be replaced with your real brand files before any store submission —
  drop the real PNGs into `apps/mobile/src/imports/` with the same
  filenames.
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
