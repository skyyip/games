// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-194a0fc24759.js');self.addEventListener('install',()=>self.skipWaiting());