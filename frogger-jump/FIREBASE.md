# Firebase · cross-device river accounts and top ten

## Current state

The application integration, email/password Auth flow, unique-name transactions, wallet transactions, run receipts, top-ten query, rules and composite index are implemented. **The user has not created a Firebase project or supplied web configuration, so the real cloud service is not enabled or deployed.** The game shows an explicit setup notice and a local unranked practice mode; there are no fake global players or fabricated rankings.

## Activate after creating the project

1. Create a Firebase project and add a **Web app**. Auth and Firestore work within the Spark plan's applicable quotas; this version does not require Cloud Functions or Admin credentials.
2. Enable **Authentication → Email/Password**. Use the same account on different devices. Add the actual web domains, such as `skyyip.github.io` and `sky-playground.com`, to the authorized domains where required by your Auth configuration.
3. Create a Cloud Firestore database, choose a suitable region, then deploy this folder's **rules and index**. Do not leave test-mode write permissions active.
4. Paste the web app's public `firebaseConfig` object (apiKey, authDomain, projectId, appId and supplied optional fields) into `src/firebase-settings.js`, replacing the default unconfigured expression. Alternatively set `window.FROGGER_FIREBASE_CONFIG` before the game module loads. These public web identifiers are not Admin credentials; never put a service-account/private key into the browser.
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

Coins use the same deterministic formula on client and in rules. Purchases deduct the exact species price, grant one new owned animal and never charge again when switching an owned animal. Transaction conflicts retry against the latest balance. Clients cannot write someone else's wallet or record, forge name ownership, add a paid animal for free or settle an already completed run again.

A disconnected finished run is retained under `frogger-jump.pending.v1` and can be retried. It remains unranked/unpaid until accepted by Firebase. Retrying the same finished receipt is idempotent. A run superseded by a different device is not paid twice; its stale pending receipt is cleared. No local guest wallet/score is promoted into a cloud account.

The public leaderboard reads at most ten documents on demand, with a ten-second refresh cooldown. Identity restoration reads the signed-in player's profile. Wallets refresh on returning to the page. There are no per-frame or per-second database writes, global listeners, or high-frequency leaderboard polling.

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

**These emulator checks were not executed successfully in this environment:** the required Firestore emulator JAR download returned **403 Domain forbidden**. The harness and rules are prepared, but they must not be represented as emulator-certified until run in an environment that can fetch it. No real cloud deployment was attempted without the user's Firebase project.

For full Auth-emulator browser testing, run the configured Auth/Firestore emulators on 9098/8089. The browser may set `window.FROGGER_FIREBASE_EMULATORS=true` with demo web config **only on localhost/127.0.0.1**; production hosts cannot activate this path.
