// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-641dd965f17d.js');self.addEventListener('install',()=>self.skipWaiting());