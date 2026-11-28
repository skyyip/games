// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1770125bc713.js');self.addEventListener('install',()=>self.skipWaiting());