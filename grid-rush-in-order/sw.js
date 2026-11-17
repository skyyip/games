// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f7f1a60d25d3.js');self.addEventListener('install',()=>self.skipWaiting());