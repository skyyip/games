import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { games, siteUrl } from './game-catalog.mjs';
import { applySeo } from './seo.mjs';
import { messages } from '../grid-rush/src/translations.js';

const root = resolve(import.meta.dirname, '..');
const directory = resolve(process.argv[2] || root);
const basePath = process.argv[3] || '/games/';
const built = directory !== root;
const titles = new Set(), descriptions = new Set();
const pages = ['index.html', ...games.map(game => `${game.slug}/index.html`)];
const urls = pages.map(page => siteUrl + page.replace(/index\.html$/, ''));
for (const [index, page] of pages.entries()) {
  const html = await readFile(resolve(directory, page), 'utf8');
  const title = [...html.matchAll(/<title\b[^>]*>(.*?)<\/title>/gs)];
  assert.equal(title.length, 1, `${page}: one title`);
  assert.ok(!titles.has(title[0][1]), `${page}: unique title`); titles.add(title[0][1]);
  const description = [...html.matchAll(/<meta name="description" content="([^"]+)"/g)];
  assert.equal(description.length, 1, `${page}: one description`);
  assert.ok(!descriptions.has(description[0][1]), `${page}: unique description`); descriptions.add(description[0][1]);
  assert.equal([...html.matchAll(/rel="canonical"/g)].length, 1, `${page}: one canonical`);
  assert.ok(html.includes(`<link rel="canonical" href="${urls[index]}">`), `${page}: canonical production URL`);
  assert.ok(html.includes(`<meta property="og:url" content="${urls[index]}">`), `${page}: matching Open Graph URL`);
  assert.ok(!/noindex|nosnippet/i.test(html), `${page}: no accidental indexing restriction`);
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter(match => match[1].includes('application/ld+json'));
  assert.equal(scripts.length, 1, `${page}: one JSON-LD graph`);
  assert.ok(!/\bsrc=/.test(scripts[0][1]), `${page}: JSON-LD remains inline after packaging`);
  const schema = JSON.parse(scripts[0][2]);
  assert.equal(schema['@context'], 'https://schema.org');
  const game = games.find(item => page === `${item.slug}/index.html`);
  if (game) {
    assert.equal(game.zh, messages[game.name], `${page}: Chinese name matches the game UI`);
    const entity = schema['@graph'].find(item => item['@type'] === 'VideoGame');
    assert.equal(entity.name, game.name); assert.equal(entity.url, urls[index]);
    assert.deepEqual([entity.numberOfPlayers.minValue, entity.numberOfPlayers.maxValue], game.players);
    assert.ok(html.includes(game.intro.replaceAll('&', '&amp;')), `${page}: game facts in static HTML`);
    assert.ok(html.includes(game.chinese), `${page}: Traditional Chinese guide in static HTML`);
  } else {
    const list = schema['@graph'].find(item => item['@type'] === 'ItemList');
    const visible = [...html.matchAll(/<article\b([^>]*\bdata-game="([^"]+)"[^>]*)>/g)]
      .filter(match => !/\bhidden\b/.test(match[1])).map(match => siteUrl + match[2] + '/');
    assert.equal(list.numberOfItems, visible.length);
    assert.deepEqual(new Set(list.itemListElement.map(item => item.url)), new Set(visible), 'Collection matches visible cards, including hidden-game policy');
  }
  const guide = html.match(/<!-- game-guide:start -->([\s\S]*?)<!-- game-guide:end -->/)?.[1];
  assert.ok(guide, `${page}: readable guide`);
  for (const match of guide.matchAll(/href="([^"]+)"/g)) {
    const target = resolve(dirname(resolve(directory, page)), match[1], 'index.html');
    await access(target);
  }
  const image = new URL(html.match(/<meta property="og:image" content="([^"]+)"/)[1]);
  assert.equal(image.origin, new URL(siteUrl).origin);
  assert.ok(image.pathname.startsWith(basePath), `${page}: share image uses deployment base`);
  await access(resolve(directory, image.pathname.slice(basePath.length)));
  if (!built) assert.equal(applySeo(html, page), html, `${page}: regeneration is stable`);
}
const sitemap = await readFile(resolve(directory, 'sitemap.xml'), 'utf8');
assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]), urls);
const llms = await readFile(resolve(directory, 'llms.txt'), 'utf8');
for (const game of games.filter(item => item.listed !== false)) assert.ok(llms.includes(siteUrl + game.slug + '/'));
console.log(`SEO checks passed for ${pages.length} ${built ? 'built' : 'source'} pages: metadata, canonical URLs, inline schema, visible facts, navigation, share images and discovery files.`);
