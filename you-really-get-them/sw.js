// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ab1b566c61c2.js');self.addEventListener('install',()=>self.skipWaiting());