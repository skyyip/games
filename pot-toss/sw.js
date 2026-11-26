// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-103b7f1c1c58.js');self.addEventListener('install',()=>self.skipWaiting());