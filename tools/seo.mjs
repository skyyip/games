import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { games, siteUrl } from './game-catalog.mjs';

const root = resolve(import.meta.dirname, '..');
const escape = text => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const json = value => JSON.stringify(value, null, 2).replaceAll('<', '\\u003c');
const block = (name, text) => `<!-- ${name}:start -->\n${text}\n<!-- ${name}:end -->`;
const stripBlock = (source, name) => source.replace(new RegExp(`<!-- ${name}:start -->[\\s\\S]*?<!-- ${name}:end -->\\n?`, 'g'), '');
const gameUrl = game => siteUrl + game.slug + '/';
const imageUrl = siteUrl + 'grid-rush/assets/icons/icon-512.png';
const playerLabel = game => game.players[1] === 1 ? '1 player' : game.players[0] === game.players[1] ? `${game.players[0]} players on one device` : `${game.players[0]}–${game.players[1]} players on one device`;

function gameSchema(game) {
  return {
    '@type': 'VideoGame', '@id': gameUrl(game) + '#game', name: game.name, alternateName: game.zh,
    url: gameUrl(game), description: game.intro, genre: game.genre,
    inLanguage: ['en', 'zh-Hant'], gamePlatform: 'Web browser', applicationCategory: 'GameApplication',
    operatingSystem: 'Any operating system with a modern web browser', isAccessibleForFree: true,
    playMode: game.players[1] === 1 ? 'https://schema.org/SinglePlayer' : 'https://schema.org/MultiPlayer',
    numberOfPlayers: { '@type': 'QuantitativeValue', minValue: game.players[0], maxValue: game.players[1] },
    author: { '@type': 'Person', name: 'Sky Yip' }, isPartOf: { '@id': siteUrl + '#collection' },
  };
}

const faqs = [
  ['What is Sky Playground?', 'Sky Playground is a collection of free browser games by Sky Yip, including solo arcade challenges, puzzles and local party games.'],
  ['Do I need to download an app or create an account?', 'No account or app download is needed to play. Open a game in a modern browser and enable JavaScript.'],
  ['Which games can friends play together?', 'Tap & Spill, Line Up, Just a Sec, Memory Trace, Dice & Delight and Pocket Poker support 2–6 people sharing one device. Mahjong Match is for two players. These are local games, with no online matchmaking.'],
  ['Can I play on a phone or desktop?', 'The games work in modern phone and desktop browsers. Motion-based games provide alternative controls; Flick Force uses a touch swipe or mouse drag.'],
  ['Which languages are available?', 'Use 中 / EN on the playground to choose Traditional Chinese or English. The selection carries into the games.'],
];

const styles = `.game-guide{box-sizing:border-box;width:100%;max-width:860px;min-width:0;margin:28px auto;padding:16px 18px;border:1px solid currentColor;border-radius:16px;color:inherit;font:400 14px/1.7 system-ui,sans-serif;text-align:left;white-space:normal;overflow-wrap:anywhere;user-select:text;touch-action:pan-y pinch-zoom}.game-guide summary{cursor:pointer;min-height:44px;align-content:center;font-weight:700;list-style:revert}.game-guide h2,.game-guide h3{font-family:inherit;font-size:18px;line-height:1.4;letter-spacing:normal;color:inherit;margin:20px 0 8px}.game-guide p{font:inherit;color:inherit;margin:10px 0;max-width:75ch}.game-guide a{color:inherit;text-decoration:underline;text-underline-offset:3px}.game-guide a:focus-visible,.game-guide summary:focus-visible{outline:3px solid currentColor;outline-offset:4px}.game-guide li{margin:6px 0}.game-guide nav{display:block;position:static;margin:16px 0}.game-guide [lang=zh-Hant]{font-family:system-ui,'PingFang TC','Noto Sans TC',sans-serif}.game-guide .guide-facts{font-weight:600}.is-playing .game-guide{display:none}@media(max-width:640px){.game-guide{margin:20px auto;padding:12px 14px;font-size:14px}}`;

function guide(game) {
  if (!game) return `<section class="game-guide" id="about-games" aria-labelledby="about-games-title" lang="en" translate="no">
  <h2 id="about-games-title">Free browser games for quick breaks and shared screens</h2>
  <p>Sky Playground is a collection of free games by Sky Yip. Play solo arcade challenges and puzzles, or pass one device between friends for a local party game. No account or app download is needed.</p>
  <p lang="zh-Hant">Sky Playground 是由 Sky Yip 製作的免費網頁小遊戲集。可獨自挑戰反應、記憶及平衡遊戲，亦可與朋友共用一部裝置輪流玩派對遊戲；毋須註冊帳戶或下載應用程式。</p>
  <nav aria-label="Choose a browser game"><a href="grid-rush/">Quick solo game: Grid Rush</a> · <a href="marble-maze/">Tilt puzzle: Marble &amp; Mist</a> · <a href="dice-party/">2–6 player dice game: Dice &amp; Delight</a> · <a href="mahjong-match/">Two-player tile game: Mahjong Match</a></nav>
  <h2>Questions about playing</h2>
  ${faqs.map(([q, a]) => `<h3>${escape(q)}</h3>\n  <p>${escape(a)}</p>`).join('\n  ')}
</section>`;
  const related = game.related.map(slug => games.find(item => item.slug === slug));
  return `<details class="game-guide" id="about-game" lang="en" translate="no">
  <summary>About ${escape(game.name)} / <span lang="zh-Hant">玩法介紹</span></summary>
  <h2>${escape(game.name)} — ${escape(game.topic)}</h2>
  <p class="guide-facts">Free browser game · ${escape(playerLabel(game))} · English / 繁體中文</p>
  <p>${escape(game.intro)}</p>
  <p lang="zh-Hant">${escape(game.zh)}：${escape(game.chinese)}</p>
  <h3>How to play</h3>
  <ol>${game.steps.map(step => `<li>${escape(step)}</li>`).join('')}</ol>
  <p>Play in a modern phone or desktop browser with JavaScript enabled. No account or app download is required. Choose 中 / EN on the playground for Traditional Chinese or English.</p>
  <nav aria-label="More browser games"><a href="../">Sky Playground — all games</a> · ${related.map(item => `<a href="../${item.slug}/">${escape(item.name)}</a>`).join(' · ')}</nav>
</details>`;
}

export function applySeo(source, page) {
  const game = page === 'index.html' ? null : games.find(item => page === `${item.slug}/index.html`);
  if (page !== 'index.html' && !game) throw Error(`Missing SEO catalog entry: ${page}`);
  const url = game ? gameUrl(game) : siteUrl;
  const title = game ? `${game.name} — ${game.topic} | Sky Playground` : 'Free Browser Games & Local Party Games | Sky Playground';
  const description = game?.description ?? 'Play free browser games at Sky Playground: quick solo challenges, puzzles and local party games for 2–6 players. No account or app download needed.';
  const graph = game ? [
    { '@type': 'WebPage', '@id': url + '#page', url, name: title, description, inLanguage: ['en', 'zh-Hant'], mainEntity: { '@id': url + '#game' }, breadcrumb: { '@id': url + '#breadcrumbs' } },
    gameSchema(game),
    { '@type': 'BreadcrumbList', '@id': url + '#breadcrumbs', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Sky Playground', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: game.name, item: url },
    ] },
  ] : [
    { '@type': 'CollectionPage', '@id': siteUrl + '#collection', url: siteUrl, name: 'Sky Playground', description, inLanguage: ['en', 'zh-Hant'], mainEntity: { '@id': siteUrl + '#games' }, author: { '@type': 'Person', name: 'Sky Yip' } },
    { '@type': 'ItemList', '@id': siteUrl + '#games', name: 'Sky Playground browser games', numberOfItems: games.filter(item => item.listed !== false).length,
      itemListElement: games.filter(item => item.listed !== false).map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, url: gameUrl(item) })) },
  ];
  let html = stripBlock(stripBlock(source, 'seo'), 'game-guide');
  html = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>\s*/i, '')
    .replace(/<meta\b(?=[^>]*\bname=["'](?:description|robots|twitter:[^"']+)["'])[^>]*>\s*/gi, '')
    .replace(/<meta\b(?=[^>]*\bproperty=["']og:[^"']+["'])[^>]*>\s*/gi, '')
    .replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>\s*/gi, '');
  const metadata = `<title translate="no">${escape(title)}</title>
<meta name="description" content="${escape(description)}" translate="no">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Sky Playground">
<meta property="og:locale" content="en_US">
<meta property="og:locale:alternate" content="zh_TW">
<meta property="og:title" content="${escape(title)}">
<meta property="og:description" content="${escape(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${imageUrl}">
<meta property="og:image:width" content="512">
<meta property="og:image:height" content="512">
<meta property="og:image:alt" content="Sky Playground mascot">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${escape(title)}">
<meta name="twitter:description" content="${escape(description)}">
<meta name="twitter:image" content="${imageUrl}">
<meta name="twitter:image:alt" content="Sky Playground mascot">
<script type="application/ld+json">${json({ '@context': 'https://schema.org', '@graph': graph })}</script>
<style>${styles}</style>`;
  html = html.replace(/<\/head>/i, block('seo', metadata) + '\n</head>');
  const content = block('game-guide', guide(game));
  if (game?.slug === 'tap-and-spill') {
    html = html.replace(/(<button\b[^>]*\bid="start"[\s\S]*?<\/button>)/i, '$1\n' + content);
  } else if (!game) {
    html = html.replace(/<footer\b/i, content + '\n<footer');
  } else {
    // Keep the guide inside the main landmark, after all existing game controls.
    const position = html.lastIndexOf('</main>');
    if (position < 0) throw Error(`Missing main landmark: ${page}`);
    html = html.slice(0, position) + content + '\n' + html.slice(position);
  }
  return html;
}

export async function writeDiscovery(out) {
  const urls = [siteUrl, ...games.map(gameUrl)];
  await writeFile(resolve(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${escape(url)}</loc></url>`).join('\n')}\n</urlset>\n`);
  // Optional human-readable inventory; AI indexing does not require llms.txt.
  await writeFile(resolve(out, 'llms.txt'), `# Sky Playground\n\n> Free browser games by Sky Yip. English and Traditional Chinese.\n\nCanonical collection: ${siteUrl}\nNo account or app download is needed. JavaScript is required to play.\nParty games use one shared device, without online matchmaking.\n\n## Games\n\n${games.filter(game => game.listed !== false).map(game => `- [${game.name}](${gameUrl(game)}): ${playerLabel(game)}. ${game.intro}`).join('\n')}\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  for (const page of ['index.html', ...games.map(game => `${game.slug}/index.html`)]) {
    const path = resolve(root, page), source = await readFile(path, 'utf8');
    const html = applySeo(source, page);
    if (source !== html) await writeFile(path, html);
  }
  await writeDiscovery(root);
  console.log(`Updated SEO and readable guides for ${games.length + 1} pages at ${siteUrl}`);
}
