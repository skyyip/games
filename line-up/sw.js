// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e7391fefc50c.js');self.addEventListener('install',()=>self.skipWaiting());