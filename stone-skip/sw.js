// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-26293bc804f0.js');self.addEventListener('install',()=>self.skipWaiting());