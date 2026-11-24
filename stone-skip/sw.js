// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-bf54df0f2c01.js');self.addEventListener('install',()=>self.skipWaiting());