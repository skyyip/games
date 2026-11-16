// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-808a58f7bcad.js');self.addEventListener('install',()=>self.skipWaiting());