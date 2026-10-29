import { messages } from './translations.js';

export const LANGUAGE_KEY = 'playground.language.v1';
const supported = new Set(['en', 'zh-Hant']);
let storage, persistent = true, language = 'zh-Hant';
try {
  storage = window.localStorage;
  const saved = storage.getItem(LANGUAGE_KEY);
  if (supported.has(saved)) language = saved;
} catch { persistent = false; }
const requested = new URL(location.href).searchParams.get('lang');
if (supported.has(requested)) {
  language = requested;
  try { storage.setItem(LANGUAGE_KEY, language); }
  catch { persistent = false; }
}
document.documentElement.lang = language;

const folded = new Map(Object.entries(messages).map(([key, value]) => [key.toLowerCase(), value]));
const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const literalLength = text => text.replace(/\{\w+\}/g, '').length;
const patterns = Object.entries(messages).filter(([key]) => key.includes('{'))
  .sort(([a], [b]) => literalLength(b) - literalLength(a)).map(([key, value]) => {
  const names = [...key.matchAll(/\{(\w+)\}/g)].map(match => match[1]);
  const expression = key.split(/\{\w+\}/).map(escape).join('(.+?)');
  return { expression: new RegExp(`^${expression}$`, 'u'), names, value };
});

export function getLanguage() { return language; }

// Translate presentation only: game state, input values and saved scores are untouched.
const translations = new Map();
const TRANSLATION_LIMIT = 2048;
export function translate(message, depth = 0) {
  if (language === 'en' || depth > 5 || !/[A-Za-z]/.test(message)) return message;
  const key = depth + ':' + message;
  if (translations.has(key)) return translations.get(key);
  const value = translateUncached(message, depth);
  if (translations.size >= TRANSLATION_LIMIT) translations.clear();
  translations.set(key, value);
  return value;
}
function translateUncached(message, depth = 0) {
  if (language === 'en' || depth > 5 || !/[A-Za-z]/.test(message)) return message;
  const exact = Object.hasOwn(messages, message) ? messages[message] : folded.get(message.toLowerCase());
  if (exact !== undefined && !message.includes('{')) return exact;
  for (const { expression, names, value } of patterns) {
    const match = expression.exec(message);
    if (!match) continue;
    const params = Object.fromEntries(names.map((name, index) => [name, match[index + 1]]));
    return value.replace(/\{(\w+)\}/g, (_, name) =>
      name === 'name' || name === 'names' ? params[name] : translate(params[name], depth + 1));
  }
  // Several game announcements join independently generated sentences.
  const sentences = message.split(/(?<=[.!?])\s+(?=[A-Z])/u);
  return sentences.length > 1 ? sentences.map(part => translate(part, depth + 1)).join(' ') : message;
}

const originals = new WeakMap();
const attributes = ['aria-label', 'aria-valuetext', 'title', 'placeholder', 'content'];
const ignored = 'script, style, noscript, [translate="no"], .brand, .language-switch';
const playerNames = '#next-player, #turn-name, .result-person > strong, #loser > span, #stats .n > span:first-child';

function translateText(node) {
  const current = node.nodeValue, previous = originals.get(node);
  if (previous?.output === current && previous.language === language) return;
  // Timers, scores and authored Chinese need no dictionary or ancestor walk.
  if (!previous && !/[A-Za-z]/.test(current)) return;
  const parent = node.parentElement;
  if (!parent || parent.closest(ignored) || parent.matches(playerNames)) return;
  const source = previous?.output === current ? previous.source : current;
  const output = source.replace(/\S[\s\S]*\S|\S/u, text => translate(text));
  originals.set(node, { source, output, language });
  if (current !== output) node.nodeValue = output;
}

function translateAttributes(element) {
  if (element.closest('script, style, [translate="no"], .language-switch')) return;
  let saved = originals.get(element);
  if (!saved) { saved = new Map(); originals.set(element, saved); }
  for (const name of attributes) {
    if (!element.hasAttribute(name)) continue;
    // Only metadata descriptions and app names use the content attribute.
    if (name === 'content' && !element.matches('meta[name="description"], meta[name="apple-mobile-web-app-title"]')) continue;
    const current = element.getAttribute(name), previous = saved.get(name);
    if (previous?.output === current && previous.language === language) continue;
    const source = previous?.output === current ? previous.source : current;
    const output = translate(source);
    saved.set(name, { source, output, language });
    if (current !== output) element.setAttribute(name, output);
  }
}

function translateTree(root) {
  if (root.nodeType === Node.TEXT_NODE) { translateText(root); return; }
  if (root.nodeType !== Node.ELEMENT_NODE || root.matches(ignored)) return;
  translateAttributes(root);
  if (root.localName === 'svg' && !root.querySelector('text, tspan, title, desc, [aria-label], [title]')) return;
  for (const child of root.childNodes) translateTree(child);
}

function updateLinks() {
  if (persistent) return;
  // Keep the language across navigation even if browser storage is blocked/full.
  for (const link of document.querySelectorAll('a[href]')) {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) continue;
    const url = new URL(href, location.href);
    if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) continue;
    url.searchParams.set('lang', language);
    link.href = url.href;
  }
}

function applyLanguage() {
  document.documentElement.lang = language;
  translateTree(document.documentElement);
  for (const button of document.querySelectorAll('[data-language]')) {
    button.setAttribute('aria-pressed', String(button.dataset.language === language));
  }
  updateLinks();
  document.dispatchEvent(new Event('languagechange'));
}

function init() {
  applyLanguage();
  const switcher = document.querySelector('.language-switch');
  if (switcher) {
    switcher.hidden = false;
    switcher.addEventListener('click', event => {
      const button = event.target.closest('button[data-language]');
      if (!button || !supported.has(button.dataset.language)) return;
      language = button.dataset.language;
      try { storage.setItem(LANGUAGE_KEY, language); persistent = true; }
      catch { persistent = false; }
      if (requested || !persistent) {
        const url = new URL(location.href);
        url.searchParams.set('lang', language);
        history.replaceState(null, '', url);
      }
      applyLanguage();
    });
  }
  // Observe only changed text, new subtrees and presentation attributes. Numeric
  // timers and scores bypass dictionary/pattern matching; CSS motion is unaffected.
  new MutationObserver(records => {
    const trees = new Set(), texts = new Set(), attrs = new Set();
    for (const record of records) {
      const parent = record.target.nodeType === Node.ELEMENT_NODE ? record.target : record.target.parentElement;
      // Games with their own bilingual renderer and purely decorative SVGs opt out.
      if (!parent || parent.closest(ignored)) continue;
      if (record.type === 'characterData') texts.add(record.target);
      else if (record.type === 'attributes') attrs.add(record.target);
      else for (const node of record.addedNodes) trees.add(node);
    }
    for (const node of trees) if (node.isConnected && !trees.has(node.parentNode)) translateTree(node);
    for (const node of texts) if (node.isConnected) translateText(node);
    for (const node of attrs) if (node.isConnected) translateAttributes(node);
  }).observe(document.documentElement, {
    subtree: true, childList: true, characterData: true,
    attributes: true, attributeFilter: attributes,
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();
