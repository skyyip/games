import test from 'node:test';
import assert from 'node:assert/strict';
import { BANK, AIR_BANK, MIXED_BANK, FACTIONS } from '../src/questions.js';

test('five factions have at least ten playable classic questions', () => {
  assert.deepEqual(Object.keys(BANK), ['women', 'men', 'dog', 'cat', 'duo']);
  for (const [id, questions] of Object.entries(BANK)) {
    assert.ok(questions.length >= 10, id);
    for (const q of questions) {
      assert.equal(q.opts.length, 4);
      assert.ok(q.correct >= 0 && q.correct < 4);
      assert.ok(q.text && q.why);
    }
  }
});


test('151-question attachment entries and two duo examples are playable', () => {
  const expected = { women: 30, men: 30, dog: 30, cat: 30, duo: 33 };
  for (const [id, count] of Object.entries(expected)) {
    const attached = BANK[id].filter(q => q.tag === '附件完整題庫');
    assert.equal(attached.length, count, id);
    for (const q of attached) {
      assert.equal(q.opts.length, 4);
      assert.equal(q.damageByOption.length, 4);
      assert.equal(q.damageByOption[q.correct], null);
      q.damageByOption.forEach((damage, index) => {
        if (index !== q.correct && damage !== null) assert.ok(Number.isInteger(damage) && damage >= 25 && damage <= 100);
      });
      assert.ok(q.text && q.why);
    }
  }
});
test('all faction metadata is present', () => {
  for (const id of Object.keys(BANK)) {
    assert.ok(FACTIONS[id].name);
    assert.ok(FACTIONS[id].emoji);
    assert.match(FACTIONS[id].color, /^#/);
  }
});

test('reading-the-room mode has five complete scenarios per faction', () => {
  assert.deepEqual(Object.keys(AIR_BANK), ['women', 'men', 'dog', 'cat', 'duo']);
  for (const [id, questions] of Object.entries(AIR_BANK)) {
    assert.equal(questions.length, 5, id);
    for (const q of questions) {
      assert.equal(q.opts.length, 4);
      assert.equal(q.profiles.length, 4);
      for (const profile of q.profiles) {
        assert.equal(profile.length, 5);
        for (const score of profile) assert.ok(Number.isInteger(score) && score >= 0 && score <= 4);
      }
      assert.ok(q.text && q.why);
    }
  }
});

test('mixed survival mode has four complete hybrid scenarios per faction', () => {
  assert.deepEqual(Object.keys(MIXED_BANK), ['women', 'men', 'dog', 'cat', 'duo']);
  for (const [id, questions] of Object.entries(MIXED_BANK)) {
    assert.equal(questions.length, 4, id);
    for (const q of questions) {
      assert.equal(q.opts.length, 4);
      assert.equal(q.profiles.length, 4);
      for (const profile of q.profiles) {
        assert.equal(profile.length, 5);
        for (const score of profile) assert.ok(Number.isInteger(score) && score >= 0 && score <= 4);
      }
      assert.ok(q.text && q.why);
    }
  }
});

test('every faction run uses the 5 + 4 + 3 twelve-question mix', () => {
  for (const id of Object.keys(BANK)) {
    assert.ok(BANK[id].length >= 5, id);
    assert.equal(5 + 4 + 3, 12, id);
    assert.equal(AIR_BANK[id].length, 5, id);
    assert.equal(MIXED_BANK[id].length, 4, id);
  }
});

test('mobile question, result, poster and cloud counts stay aligned', async () => {
  const { readFileSync } = await import('node:fs');
  const { resolve } = await import('node:path');
  const root = resolve('.');
  const html = readFileSync(resolve(root, 'index.html'), 'utf8');
  const app = readFileSync(resolve(root, 'src/app.js'), 'utf8');
  const cloud = readFileSync(resolve(root, 'src/firebase/cloud.js'), 'utf8');
  const poster = readFileSync(resolve(root, 'src/poster/poster.js'), 'utf8');
  const css = readFileSync(resolve(root, 'styles.css'), 'utf8');
  assert.match(app, /questionCount=12/);
  assert.match(app, /Number\(r\.questionCount\)\|\|12/);
  assert.match(app, /pick\(BANK\[faction\],5,/);
  assert.match(app, /pick\(AIR_BANK\[faction\],4,/);
  assert.match(app, /pick\(MIXED_BANK\[faction\],3,/);
  assert.match(app, /correct\}\/12 題答對/);
  assert.match(app, /leader-correct[^\x60]*\/12/);
  assert.match(html, /id="resultCorrect">0 \/ 12/);
  assert.match(poster, /questionCount\|\|12/);
  assert.match(cloud, /questionCount\|\|12/);
  assert.match(app, /const cost=50/);
  assert.match(app, /state\.coins\+=25/);
  assert.match(app, /signUpEmail\(email\(\),password\(\)\)/);
  assert.match(app, /signInGoogle/);
  assert.match(cloud, /createUserWithEmailAndPassword/);
  assert.match(cloud, /signInWithRedirect/);
  assert.match(cloud, /linkWithCredential/);
  assert.match(css, /@media \(max-width: 600px\)/);
  assert.match(css, /\.answer-btn \{ min-height: 72px/);
  assert.match(css, /\.result-actions #downloadPoster \{ grid-column: 1 \/ -1/);
});


test('Firestore rules accept the current 12-question game data shape', async () => {
  const { readFileSync } = await import('node:fs');
  const { resolve } = await import('node:path');
  const rules = readFileSync(resolve('.', 'firestore.rules'), 'utf8');

  assert.match(rules, /request\.resource\.data\.mode == 'mixed'/);
  assert.match(rules, /request\.resource\.data\.questionCount == 12/);
  assert.match(rules, /request\.resource\.data\.correct <= 12/);
  assert.match(rules, /data\.bestCorrect <= 12/);
  assert.match(rules, /data\.correct <= 12/);
  assert.match(rules, /validDimensions\(request\.resource\.data\.dimensions\)/);
  assert.match(rules, /validProfileMetadata\(request\.resource\.data\)/);
  assert.match(rules, /request\.resource\.data\.diff\(resource\.data\)\.affectedKeys\(\)[\s\S]*?hasOnly\(\['displayName', 'playerName', 'favoriteCards', 'photoURL', 'updatedAt']\)/);
  assert.match(rules, /request\.resource\.data\.keys\(\)\.hasOnly\(\['displayName', 'playerName', 'favoriteCards', 'photoURL', 'updatedAt']\)/);
  assert.match(rules, /request\.resource\.data\.createdAt is timestamp/);
  assert.match(rules, /data\.submittedAt is int/);
});


test('Spark cloud profiles never accept client-managed currency or cards', async () => {
  const { readFileSync } = await import('node:fs');
  const { resolve } = await import('node:path');
  const rules = readFileSync(resolve('.', 'firestore.rules'), 'utf8');
  const cloud = readFileSync(resolve('.', 'src/firebase/cloud.js'), 'utf8');

  const profileRules = rules.slice(rules.indexOf('match /users/{uid}'), rules.indexOf('match /leaderboard/{uid}'));
  assert.match(profileRules, /allow create:[\s\S]*?keys\(\)\.hasOnly\(\['displayName', 'playerName', 'favoriteCards', 'photoURL', 'updatedAt']\)/);
  assert.match(profileRules, /allow update:[\s\S]*?affectedKeys\(\)[\s\S]*?hasOnly\(\['displayName', 'playerName', 'favoriteCards', 'photoURL', 'updatedAt']\)/);
  assert.doesNotMatch(cloud, /coins:data\.coins|cards:data\.cards|coins:local\.coins|cards:local\.cards/);
  assert.match(cloud, /Cloud profile stores identity metadata only/);
});


test('leaderboard is stored and queried independently by faction', async () => {
  const { readFileSync } = await import('node:fs');
  const { resolve } = await import('node:path');
  const cloud = readFileSync(resolve('.', 'src/firebase/cloud.js'), 'utf8');
  const app = readFileSync(resolve('.', 'src/app.js'), 'utf8');
  const rules = readFileSync(resolve('.', 'firestore.rules'), 'utf8');
  const indexes = JSON.parse(readFileSync(resolve('.', 'firestore.indexes.json'), 'utf8'));

  assert.match(cloud, /leaderboard',\`\$\{currentUser\.uid\}_\$\{faction\}\`/);
  assert.match(cloud, /where\('faction','==',faction\)/);
  assert.match(app, /data-leaderboard-faction/);
  assert.match(app, /我的戰績/);
  assert.match(rules, /data\.faction == faction/);
  assert.match(rules, /entryId == request\.auth\.uid \+ '_' \+ request\.resource\.data\.faction/);
  assert.ok(indexes.indexes.some(index =>
    index.collectionGroup === 'leaderboard' &&
    index.fields.map(field => field.fieldPath).join(',') === 'faction,bestHp,bestCorrect'
  ));
});

test('duo mode uses five setup questions and a separate pass-the-phone test flow', async () => {
  const { readFileSync } = await import('node:fs');
  const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(app, /duoSetupQuestions=shuffle\(BANK\.duo\)\.slice\(0,5\)/);
  assert.match(app, /function startDuoSetup\(\)[\s\S]*?\$\('modal'\)\.showModal\(\);renderDuoSetup\(0\)/);
  assert.match(app, /function beginDuoTest\(\)/);
  assert.match(app, /function answerDuoTest\(choice\)/);
  assert.match(app, /function stopHoldAnimation\(\)/);
  assert.match(app, /function setupHold\(\)[\s\S]*?holdFrame=frame=requestAnimationFrame\(loop\)/);
  assert.match(app, /function answer\(choice\)[\s\S]*?stopHoldAnimation\(\)/);
  assert.match(app, /function feedback\(msg\)[\s\S]*?stopHoldAnimation\(\)/);
  assert.match(app, /function finishDuoTest\(\)/);
  assert.match(app, /duoExpected\.push\(Number\(e\.target\.closest\('\[data-duo-expected\]'\)\.dataset\.duoExpected\)\)/);
  assert.match(app, /duoExpected\[i\]===duoTestAnswers\[i\]/);
  assert.match(html, /雙人互測模式/);
  assert.match(html, /情侶／好友現場出題拷問/);
});


test('Google authentication restores redirect state before enabling the UI', async () => {
  const { readFileSync } = await import('node:fs');
  const cloud = readFileSync(new URL('../src/firebase/cloud.js', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

  assert.match(cloud, /const authStateReady=new Promise\(resolve=>[\s\S]*?authSdk\.onAuthStateChanged/);
  assert.ok(cloud.indexOf('authSdk.onAuthStateChanged') < cloud.indexOf('authSdk.getRedirectResult'));
  assert.match(cloud, /const result=await authSdk\.getRedirectResult\(auth\)/);
  assert.match(cloud, /const resolvedUser=auth\.currentUser\|\|redirectUser\|\|currentUser/);
  assert.match(cloud, /return \{ready:true,user:currentUser,redirectError\}/);
  assert.match(cloud, /const user=auth\.currentUser\|\|currentUser/);
  assert.match(cloud, /auth\/popup-blocked[\s\S]*?return redirect\(\)/);
  assert.match(app, /auth\/unauthorized-domain/);
  assert.match(app, /auth\/popup-closed-by-user/);
  assert.match(sw, /you-really-get-them-v35/);
  assert.match(sw, /\.\/src\/firebase\/cloud\.js/);
  assert.match(sw, /requestUrl\.origin!==self\.location\.origin/);
});

test('duo mode clearly separates setup, phone handoff, answering and result review', async () => {
  const { readFileSync } = await import('node:fs');
  const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  assert.match(app, /STEP 1 · 出題者設定/);
  assert.match(app, /選擇你自己的答案/);
  assert.match(app, /我已接過手機，開始作答/);
  assert.match(app, /測試者作答 · 不設時限/);
  assert.match(app, /出題者本人/);
  assert.match(app, /出題者的答案/);
  assert.match(app, /測試者的猜測/);
  assert.match(css, /\.game-screen\.duo-mode \.answers \{ grid-template-columns: 1fr/);
  assert.match(css, /\.duo-answer-compare/);
});

test('players can set a persistent display name used throughout the game', async () => {
  const { readFileSync } = await import('node:fs');
  const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const cloud = readFileSync(new URL('../src/firebase/cloud.js', import.meta.url), 'utf8');
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
  const styles = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(html, /id="playerNameBtn"/);
  assert.match(html, /id="playerNameBtn"[^>]*hidden/);
  assert.ok(styles.includes('.player-name-btn[hidden] { display: none !important; }'));
  assert.match(styles, /\.auth-actions button\{[^}]*height:48px;min-height:48px;padding:0 8px/);
  assert.match(app, /function showPlayerNameModal\(\)/);
  assert.match(app, /saveCloudProfile\(\{playerName:name\}\)/);
  assert.match(app, /playerName=profile\?\.playerName/);
  assert.match(cloud, /currentPlayerName=name/);
  assert.match(cloud, /playerName:name/);
  assert.match(cloud, /currentPlayerName\|\|currentUser\.displayName/);
  assert.match(rules, /data\.playerName is string && data\.playerName\.size\(\) <= 20/);
});


test('favorite cards are stored per signed-in player and validated in Firestore', async () => {
  const { readFileSync } = await import('node:fs');
  const storage = readFileSync(new URL('../src/storage.js', import.meta.url), 'utf8');
  const cloud = readFileSync(new URL('../src/firebase/cloud.js', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
  assert.match(storage, /setSaveScope\(uid\)/);
  assert.match(storage, /\$\{KEY\}:\$\{scope\}/);
  assert.match(cloud, /saveCloudFavoriteCards\(cards=\[\]\)/);
  assert.match(cloud, /favoriteCards,updatedAt:fs\.serverTimestamp\(\)/);
  assert.match(app, /setSaveScope\(user&&!user\.isAnonymous\?user\.uid:'guest'\)/);
  assert.match(app, /persistFavoriteCards\(state\.cards\)/);
  assert.match(rules, /data\.favoriteCards is list && data\.favoriteCards\.size\(\) <= 100/);
  assert.match(rules, /hasOnly\(\['displayName', 'playerName', 'favoriteCards', 'photoURL', 'updatedAt'\]\)/);
});


test('player name settings button is visible only for authenticated non-anonymous users', async () => {
  const { readFileSync } = await import('node:fs');
  const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(app, /button\.hidden=\!\(user\&\&\!user\.isAnonymous\)/);
});


test('mobile responsive guardrails keep the home headline readable and header compact', async () => {
  const { readFileSync } = await import('node:fs');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
  assert.match(css, /@media \(max-width: 600px\)[\s\S]*?\.hero-copy h1 \{[\s\S]*?font-size: clamp\(18px, 5\.4vw, 24px\)/);
  assert.match(css, /@media \(max-width: 420px\)[\s\S]*?\.brand > span:last-child[\s\S]*?text-overflow: ellipsis/);
  assert.match(css, /@media \(max-width: 360px\)[\s\S]*?\.brand > span:last-child \{ display: none; \}/);
  assert.match(sw, /you-really-get-them-v35/);
});
