// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5a5eab17d258.js');self.addEventListener('install',()=>self.skipWaiting());