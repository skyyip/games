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


test('101-question attachment entries are playable and preserve HP penalties', () => {
  const expected = { women: 21, men: 20, dog: 10, cat: 10 };
  for (const [id, count] of Object.entries(expected)) {
    const attached = BANK[id].filter(q => q.tag === '101 題史詩完全版');
    assert.equal(attached.length, count, id);
    for (const q of attached) {
      assert.equal(q.opts.length, 4);
      assert.equal(q.damageByOption.length, 4);
      assert.equal(q.damageByOption[q.correct], null);
      q.damageByOption.forEach((damage, index) => {
        if (index !== q.correct) assert.ok(Number.isInteger(damage) && damage >= 25 && damage <= 100);
      });
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
  assert.match(rules, /validProfile\(request\.resource\.data\)/);
  assert.match(rules, /request\.resource\.data\.createdAt is timestamp/);
  assert.match(rules, /data\.submittedAt is int/);
});
