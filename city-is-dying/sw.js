// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-17d034d62e65.js');self.addEventListener('install',()=>self.skipWaiting());