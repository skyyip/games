// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-38ec7b9dca51.js');self.addEventListener('install',()=>self.skipWaiting());