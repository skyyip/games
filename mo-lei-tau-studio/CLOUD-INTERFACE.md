# Firebase integration contract

The current UI intentionally uses the local reducer in `src/game.js`. No cloud account or project has been supplied, and **no backend is deployed or represented as active**. Configure `src/firebase-settings.js` with the public Firebase web config only when the service is ready. The config is public identification, not a private server credential. Service-account keys must never be included in browser code.

## Client interface already implemented

`connectCloud()` lazily initializes the named Firebase app and anonymous Auth, then returns:

- `uid`: authenticated UID.
- `player()`: one `users/{uid}` document read; private to that user.
- `lobby()`: one read per movie, only when requested. Three movies use three reads.
- `rankings('boxOffice' | 'popularity' | 'anticipation')`: a capped, ordered query of at most 20 public records. Those queries cost up to 20 reads; they are not claimed to cost one read.
- `command(action)`: authenticated callable `studioCommand`, returning the authoritative player snapshot, affected crew and notice/result. It must be implemented by a trusted backend before enabling cloud mutations.
- `cooldownLoader(load)`: shares in-flight refreshes and enforces 10 seconds between requests. No `onSnapshot`, polling loop or recurring cloud timer is used.

The application does **not** switch the local store to this adapter just because a config exists. A future explicit connection/migration screen must use the authoritative command response, disclose which mode is active and stop all local currency mutations in cloud mode. Local NPC recruitment is excluded from multiplayer commands.

## Documents

`users/{uid}`: displayName, selectedMovieId, activeCharacterId, roster, per-character stats/props, wages, filmFunds, job {jobId, actorId, startedAt, endAt, fixedRewards}, trainingTicket, mentor encounter/skills, version.

`movies_crew/{soccer|scholar|kungfu}`: movieId, generation, requiredSlots (six IDs), currentSlots {roleId: {userId, character snapshot, displayName}}, totalFundRequired, currentFundCollected, status, guestCharacter, resultId, hype, updatedAt. Global action transactions must check the generation so stale clients cannot spend into a replacement crew.

`movie_results/{id}`: immutable server-created title, cast snapshot, three event outcomes, boxOffice, chemistry, guest, createdAt and reward ledger. Movie creation and payout ledger must be idempotent; reopening the result never awards again.

`public_profiles/{uid}`: display name, public actor snapshot, applause. Private user balances, jobs and profile details are not exposed on leaderboards.

## Commands expected by `studioCommand`

Use authenticated UID, never a UID from the request payload. Validate lengths/enums, use server timestamps and a Firestore transaction. Return `{player, crew?, result?, notice}`.

| action | Required server behavior |
| --- | --- |
| bootstrap | Create the starter profile once; subsequent calls only read it. |
| chooseMovie / audition / auditionPaid / selectActor | Validate starter draw count, film pool, unique ownership, costs and active contract. |
| startJob / claimJob | Set server end timestamp and reward snapshot; claim only after completion; clear job atomically. No timer writes. |
| startTraining / finishTraining / cancelTraining | Issue a server ticket and cooldown; validate duration, max hits, actor and one-time settlement. Client QTE scores alone are not proof against cheating. |
| buyProp / equip | Validate ownership and price, deduct exact authoritative wages. |
| join / leave | Claim role atomically, reject occupied slots and second roles per user, refresh the member snapshot. |
| guest / contribute | Verify crew membership, actor/film, available balance, remaining budget, generation and one-time guest fee. |
| finalize film | Trigger within the final contribution/slot transaction when both conditions hold; authoritative random events, immutable result, exactly-once payouts for all real members. |
| mentor / applaud | Verify outstanding encounter or daily per-target vote ledger, then settle once. |

Multiple viewers must not independently roll or settle one film. Use the six-member limit to bound the transaction reads/writes. A job does not update the database every second: start and claim are its only writes. Do not trust the frontend timestamp proposed in the original design.

## Security and plan boundary

`firestore.rules` allows an authenticated user to fetch their own private profile, and authenticated users to read public/crew documents with capped leaderboard lists. It denies all client writes; only a trusted Admin backend may change balances, crew reservations and results. `firebase.json` points to these rules. They have not been deployed or emulator-certified in this task.

Firebase Spark can host Auth/Firestore within its quotas, but **Cloud Functions deployment generally requires a billing-enabled Blaze project**. The adapter exposes a callable contract; it does not pretend that the callable will run on Spark for free. If remaining strictly Spark is mandatory, provide a trusted cPanel/PHP or other backend using Firebase ID-token verification and Admin/REST transactions, then substitute the `command` transport. Do not weaken write rules to make an untrusted client become the server.

No production project, domain authorization, rules deployment, secret installation or cloud data migration has been performed. FTP deployment is separately gated in the workflow and cannot be enabled by the game itself.
