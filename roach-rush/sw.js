// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b1b2469d64ab.js');self.addEventListener('install',()=>self.skipWaiting());