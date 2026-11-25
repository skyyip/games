// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-89c99c4baef9.js');self.addEventListener('install',()=>self.skipWaiting());