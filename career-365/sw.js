// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-28b5ffda910c.js');self.addEventListener('install',()=>self.skipWaiting());