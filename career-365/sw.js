// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-84d9b4d97db1.js');self.addEventListener('install',()=>self.skipWaiting());