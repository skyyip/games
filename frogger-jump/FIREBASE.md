# Firebase · cross-device river accounts and top ten

## Current state

The application integration, Google, anonymous and email/password Auth flows, unique-name transactions, wallet transactions, run receipts, top-ten query, rules and composite index are implemented. **The supplied Firebase web configuration now targets `sky-playground-3c5af`.** The client enables cloud sign-in and the leaderboard query. This does not itself create a Firestore database, enable authentication providers, deploy rules/indexes, or verify a live account flow. Those service settings must exist in Firebase Console. Local practice remains separately labelled and unranked; there are no fake global players.

## Activate after creating the project

1. Create a Firebase project and add a **Web app**. Auth and Firestore work within the Spark plan's applicable quotas; this version does not require Cloud Functions or Admin credentials.
2. Enable **Authentication → Sign-in method → Email/Password** and **Google**. For Google, choose a project support email and save the provider settings. Use the same account on different devices. Add the actual web domains, such as `skyyip.github.io` and `sky-playground.com`, to the authorized domains where required by your Auth configuration.
3. Create a Cloud Firestore database, choose a suitable region, then deploy this folder's **rules and index**. Do not leave test-mode write permissions active.
4. The supplied web app's public `firebaseConfig` is stored in `src/firebase-settings.js`. Update that file if changing projects. Alternatively set `window.FROGGER_FIREBASE_CONFIG` before the game module loads. These public web identifiers are not Admin credentials; never put a service-account/private key into the browser.
5. Rebuild and deploy the game. Verify a name reservation, sign in from another device, purchase an animal and finish a ranked run. Wait for the leaderboard index to finish building before expecting its ordered query to work.

From the repository root, after authenticating the Firebase CLI to the intended project:

```
firebase deploy --only firestore:rules,firestore:indexes \
  --project YOUR_PROJECT_ID --config frogger-jump/firebase.json
```

This command is a reference, **not an action performed by this task**. If reusing a project with other games, merge collection rules first instead of replacing unrelated rules.

## Data and privacy

- `frogger_names/{normalizedName}` stores `{uid,name}`. Creation is transactional with the owner's profile; names cannot be listed, overwritten or stolen. Names are immutable after reservation. Normalization is NFKC plus lowercase Latin; Chinese/ASCII input restrictions keep the key check enforceable by rules.
- `frogger_players/{uid}` stores the owner's wallet, unlocked/selected animal, personal best, timestamps and active/settled run IDs. Only that signed-in UID can read it. Email/password stay in Firebase Auth and are not written into public profile documents.
- `frogger_players/{uid}/runs/{id}` stores a server-timestamped start and immutable animal. Finishing changes status once, records the score/reward and updates the wallet atomically. Starting another run atomically abandons the old active run for the same account.
- `frogger_leaderboard/{uid}` exposes only UID, reserved name, best score, animal used and achievement timestamp. Query: score descending, timestamp ascending, limit 10. One row per user; a lower/equal later run does not replace the record.

Coins use the same deterministic formula on client and in rules, including bounded integer platform bonuses (lotus centre +2, shell centre +3). Publish the updated `firestore.rules` before deploying this bonus-enabled build. Existing receipts without a bonus field default to zero. Purchases deduct the exact species price, grant one new owned animal and never charge again when switching an owned animal. Transaction conflicts retry against the latest balance. Clients cannot write someone else's wallet or record, forge name ownership, add a paid animal for free or settle an already completed run again.

A disconnected finished run is retained under `frogger-jump.pending.v1` and can be retried. It remains unranked/unpaid until accepted by Firebase. Retrying the same finished receipt is idempotent. A run superseded by a different device is not paid twice; its stale pending receipt is cleared. No local guest wallet/score is promoted into a cloud account.

The public leaderboard reads at most ten documents on demand, with a ten-second refresh cooldown. Identity restoration reads the signed-in player's profile. Wallets refresh on returning to the page. There are no per-frame or per-second database writes, global listeners, or high-frequency leaderboard polling.

Signed-in players also see their own world rank, including positions outside the top ten. This reads their public leaderboard document from the server, then uses one `getCountFromServer` aggregate over the rows before its snapshot cursor. Ordering is score descending, achievement time ascending, then document ID ascending, matching the top-ten query's implicit final tie-break. No other players' records are downloaded to compute the count. The existing composite index supports this ordering; its final document-ID order is ascending.

**Publish the updated `firestore.rules` before enabling personal ranks.** Authenticated users may query the public scores collection for the aggregate; anonymous queries remain limited to ten records. Firestore rules cannot distinguish aggregate counts from ordinary collection queries, so this permits authenticated queries over the public leaderboard generally. Private wallets, names registry enumeration and run receipts retain their existing restrictions. Signing in, returning to the page or rendering the wallet reuses a rank for up to one minute; a new personal best or explicit leaderboard refresh requests an update. Missing/zero-score records show unranked; network/rules failures show a retry control. There is no rank polling or extra write.

## Limits of client-side competition

The rules use server start/end times, bounded scores and exact reward arithmetic to reject obviously impossible immediate scores and unauthorized balance changes. They do **not** replay physics on a trusted server and are not a guarantee against a modified client waiting before submitting a forged plausible score. A prize-bearing or strongly competitive leaderboard needs trusted run validation. The interface does not claim otherwise.

## Verification status and reproduction

Local game/progression unit tests and browser tests are runnable without Firebase. The security harness is `scripts/firestore-check.mjs`, invoked with `npm run test:rules --prefix frogger-jump`. With Java 21+ and Firebase CLI, run from the repository root:

```
firebase emulators:exec --project demo-frogger --only firestore \
  --config frogger-jump/firebase.json \
  "npm run test:rules --prefix frogger-jump"
```

It covers unique names/case collisions, private wallet reads, unauthorized minting, paid-animal ownership, run atomicity, exactly-once rewards, forged/other-user leaderboard writes, oversized/negative scores and bounded public queries. It uses a **demo** project, not production data.

**These emulator checks were not executed successfully in this environment:** the required Firestore emulator JAR download returned **403 Domain forbidden**. The harness and rules are prepared, but they must not be represented as emulator-certified until run in an environment that can fetch it. No real Firebase rule/index deployment or production test-account creation has been performed by the assistant.

For full Auth-emulator browser testing, run the configured Auth/Firestore emulators on 9098/8089. The browser may set `window.FROGGER_FIREBASE_EMULATORS=true` with demo web config **only on localhost/127.0.0.1**; production hosts cannot activate this path.

## Google login activation and verification

1. In project **sky-playground-3c5af**, open **Authentication → Sign-in method → Add new provider → Google**, enable it, choose the support email, and save.
2. Under **Authentication → Settings → Authorized domains**, include `skyyip.github.io` and `sky-playground.com` (plus any actual alternate hosting domain). For development, add `localhost` only if testing there.
3. Publish this folder's updated Firestore rules for platform bonuses. No leaderboard index change is required.
4. On the deployed game, choose **Player / sign in → Continue with Google**. A new account reserves a unique river name; returning users load their existing UID wallet. Canceling or blocking the popup leaves the current local wallet intact. If Firebase reports an account using another credential, the UI asks the player to use the original method instead of creating a replacement save.
5. Verify a real Google login and top-ten update after configuration. This environment's browser checks cover the UI with a mock Auth adapter and do not certify live Google OAuth or deployed rules.

## Password reset and the disabled-Google-provider error

The reported message “Firebase 尚未啟用此登入方式” corresponds to `auth/operation-not-allowed`. In **sky-playground-3c5af → Authentication → Sign-in method**, add/enable **Google**, select the **Project support email**, and save. Client code cannot enable this Console setting. Also ensure the actual game hostname appears under **Settings → Authorized domains**. No extra Firestore rule or index change is needed for this Auth update.

The password sign-in form now has **Forgot password?**. Enter the account email, then request a reset without entering the old password. The Firebase SDK sends the reset link using the project's default password-reset email template/action handler; the client requests Traditional Chinese (`zh-TW`) or English. **Email/Password** must be enabled for password accounts. The page never requests a user's current password to send the reset. The password field has an accessible show/hide eye button; the value stays unchanged when toggled and is concealed again on close, logout or sign-in submission.

The confirmation does not disclose whether an address exists. An accepted request or rate-limit response starts a 60-second local resend cooldown. Invalid addresses are caught before the SDK call. Backend rate limits and network/configuration errors remain visible with their error codes.

Google login now invokes the already-loaded popup SDK directly from the click handler. A successful Auth login followed by a failed Firestore profile read is shown as a **cloud-save loading failure**, with a retry button. It does not ask the player to register again or silently start an unranked guest run under the signed-in account.

`auth-adapter-check.mjs` exercises the real cloud module with a fake Firebase SDK; `google-ui-check.mjs` covers small-phone/landscape UI with mock Auth/mail. These checks do not send real reset email, create real accounts, enable the Google provider or certify real OAuth. Public configuration probes remained blocked by the environment proxy (403 tunnel response).
## Google and anonymous providers

Enable **Anonymous** in Firebase Console → Authentication → Sign-in method. It creates a real Firebase UID, persists its session in this browser and uses the same owner-only wallet, unique nickname, run receipts and world ranking as registered players. It is separate from unranked local practice. A first-time anonymous player reserves a nickname before starting ranked play. Losing the anonymous session can make its UID inaccessible, so the account dialog offers linking and asks for confirmation before anonymous sign-out.

Google popup calls run directly from the click handler. For an anonymous player they use `linkWithPopup`, preserving the UID, nickname, wallet, animals and scores. Email registration from an anonymous account uses `linkWithCredential` with the same preservation. A credential already attached to another account is reported without switching or merging wallets; choosing that account requires an explicit sign-out first. Ordinary Email sign-in cannot silently replace an anonymous identity. Provider cancellation, disabled-provider errors and profile-load retries remain available.

Provider availability is a Firebase setting, not a GitHub deployment setting. Live Google OAuth and anonymous account creation were not performed during local verification. The current rules already support Firebase anonymous UIDs; publish the latest rules separately for the new animal catalog and personal-rank aggregate.

## Starmouse and price update · 2026-11-03

Publish the updated rules before releasing cloud purchases: Fox costs 960, Capybara 1,000 and Mochi starmouse (`mochi`) 1,080 Frog Coins. The species list and maximum owned collection now allow eleven animals. Existing owned animals remain selected freely; no balance migration or retroactive charge is applied. The local catalog/rules contract test checks prices and species together. The expanded emulator harness includes the new animal, but live deployment and emulator certification have not been performed for this update.

## Comic friends expansion · 2026-11-03

The updated catalog/rules now add `chiikawa` (1,200), `hachiware` (1,360) and `usagi` (1,520); the maximum owned collection is fourteen. Publish the new rules before cloud purchases of these animals. The previous Fox 960, Capybara 1,000 and Starmouse 1,080 prices remain in force. The catalog contract test and emulator purchase fixture follow the complete catalog. These checks do not publish rules or certify the live Firebase backend.

## Island friends expansion · 2026-11-04

Rules now allow 22 animals, adding `kurimanju` 1,600; `rakko` 1,680; `momonga` 1,760; `shisa` 1,840; `shimajiro` 1,920; `mermaid` 2,000; `hitoha` 2,080; and `futaba` 2,160. The maximum owned collection and exact-price map are updated together. Publish these rules before cloud purchase acceptance; the local catalog/rules contract and complete-collection emulator fixture track the expanded roster. No rule deployment or live purchase certification is performed by this update.
