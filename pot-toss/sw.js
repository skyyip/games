// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3554cbbd287c.js');self.addEventListener('install',()=>self.skipWaiting());