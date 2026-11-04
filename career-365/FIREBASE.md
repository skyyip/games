# Career365 player authentication

The game reuses the public `sky-playground-3c5af` Firebase web configuration. `src/firebase-settings.js` supports an explicit `CAREER_FIREBASE_CONFIG` override (including `null` for local fixtures). Firebase runs as the named app `career-365`; Frogger's wallet/profile code is not called. Both games share the lazy Auth SDK loader and the existing installed Firebase dependency.

## Firebase Console setup

In [Authentication → Sign-in method](https://console.firebase.google.com/project/sky-playground-3c5af/authentication/providers), enable Email/Password, Google and Anonymous if they are not already enabled for the existing games. Configure Google's project support email as required by the Console. Add the actual published hostname to Authentication → Settings → Authorized domains, for example `sky-playground.com` or `skyyip.github.io`; add `localhost` only when testing that origin. Existing provider/domain settings are shared at project level.

Authentication identifies a player. Local life progress remains available; the optional private `career365_saves/{uid}` collection stores a manually uploaded snapshot. The new collection requires the combined project rules described below. This code update does not publish provider settings or test a real user's Google account.

## Behaviour

- Email login and account creation; registration requires at least8 characters in the UI. Password inputs clear after completion/error and are not saved by game code. Password reset uses a generic response.
- Google popup is invoked directly from a click after SDK readiness. Cancelled, blocked, unauthorized-domain, provider-disabled and network errors permit retry.
- Anonymous login has persistent Firebase identity where browser storage permits. Email/Google linking retains the anonymous UID and its local life. Logging into an existing Email account explicitly switches identities; an anonymous player receives a backup warning first. Credential conflicts do not silently merge lives.
- Returning-account bootstrap verifies the Firebase identity before enabling resume/new-life controls. Signing out restores the separate local guest life. A pending backup import is cancelled if the active player changes.
- Existing guest saves retain `career-365.save.v1`; accounts use a UID-specific local slot. A guest life can be explicitly copied into an empty account slot. The original local guest copy remains. JSON export/import remains available; private cloud upload/download provides an additional explicit device-transfer mechanism.
- Daily growth is scoped per player and life, while the existing12-skip allowance stays shared per browser. Initial play establishes the growth baseline; each real UTC+9 day shows one recap. It reports observed changes and never grants free stats.

## Verification

`tests/auth-adapter.test.js` runs the real adapter against a mocked SDK and checks persistence, login/create, Google popup timing, anonymous linking, password reset and setup retry. `scripts/account-growth-browser.mjs` uses a routed test-only Auth module; it never creates an actual account or sends mail. `scripts/account-production-check.mjs` loads the real bundled SDK with all remote services blocked, verifies lazy readiness and tests offline growth/save reload. Live provider completion requires a configured project and an end-user interaction on an authorized origin.

## Private cloud activation and shared rules

The Firebase project is shared with Frogger. Publish the **complete updated** [frogger-jump/firestore.rules](../frogger-jump/firestore.rules) in [Firestore → Rules](https://console.firebase.google.com/project/sky-playground-3c5af/firestore/rules). Do not replace the project rules with a career-only fragment, because that would remove other games' access. Existing Frogger rules are preserved; the only addition is an owner-only `career365_saves/{uid}` match. No database/provider setting or rule has been deployed by this change.

The save menu exposes **inspect**, **upload current life**, and **load cloud life**. No automatic last-writer-wins merge occurs. An upload uses the inspected revision inside a transaction; if another device changes it, the operation fails until the player inspects again. A UID/epoch guard discards delayed responses after identity changes. Existing local/guest lives are never silently adopted. Anonymous players should link Email/Google to recover their UID on another device.

Snapshots contain `version`, `revision`, `payload` and a server `updatedAt`. Payloads are plain JSON or `gz:`-prefixed gzip/base64. Compressed payloads may be at most850KB, with a4MiB decoded limit; invalid or oversized data cannot replace the local life. Cloud uploads deliberately contain no Email/password, identity-provider credential or public player profile. Firebase Auth remains responsible for authentication. Owner reads/deletes are allowed, list/foreign/unauthenticated access is denied. This is a personal simulation save, not an authoritative competitive score.

Offline cloud reads report unavailable instead of treating an old cache as the latest server version. Offline local play and JSON backups still work. Rules not yet published produce a clear service-unavailable message without deleting local progress.

## Emulator security checks

With the Firestore emulator running at127.0.0.1:8089, run:

```
node career-365/scripts/firestore-check.mjs
node frogger-jump/scripts/firestore-check.mjs
```

The career harness uses the shared installed `@firebase/rules-unit-testing` dependency and a demo project only. It covers owner creation/read/update/delete, cross-user and unauthenticated reads, collection enumeration, foreign writes, stale/skipped revisions, unexpected fields, invalid schema/timestamps and oversized payloads. There is no emulator JAR installed here; these checks are prepared but have not been run or certified. Real cross-device cloud completion still requires rule publication and an authorized end-user session. Cloud controller tests and browser fixtures are isolated mocks and do not claim live service certification.


本機保存更新：完整人生改用帳戶隔離的IndexedDB，localStorage只留摘要／設定。雲端仍上傳完整壓縮JSON快照，沿用相同私人UID集合與版本交易，無需因這次本機保存更新新增Firestore規則。資料庫交易解決本機分頁競爭，與雲端裝置衝突檢查分開處理；正式服務設定與部署仍需獨立驗證。
