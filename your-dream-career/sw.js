// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-fbe4afc10499.js');self.addEventListener('install',()=>self.skipWaiting());