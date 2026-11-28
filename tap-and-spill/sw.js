// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-251c4d1ff70f.js');self.addEventListener('install',()=>self.skipWaiting());