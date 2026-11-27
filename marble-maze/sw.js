// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-09aa6edbc707.js');self.addEventListener('install',()=>self.skipWaiting());