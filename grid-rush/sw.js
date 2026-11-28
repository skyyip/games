// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6afc0638b1e8.js');self.addEventListener('install',()=>self.skipWaiting());