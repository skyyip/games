// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-935aff694254.js');self.addEventListener('install',()=>self.skipWaiting());