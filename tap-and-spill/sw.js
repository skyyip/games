// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6505102667c6.js');self.addEventListener('install',()=>self.skipWaiting());