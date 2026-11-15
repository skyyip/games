// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7e4561ce2edb.js');self.addEventListener('install',()=>self.skipWaiting());