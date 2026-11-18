// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-66f1d0a52b0c.js');self.addEventListener('install',()=>self.skipWaiting());