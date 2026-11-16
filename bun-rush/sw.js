// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2053210b6ebf.js');self.addEventListener('install',()=>self.skipWaiting());