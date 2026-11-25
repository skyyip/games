// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3037f0933107.js');self.addEventListener('install',()=>self.skipWaiting());