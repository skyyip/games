// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5f7fee5a7d06.js');self.addEventListener('install',()=>self.skipWaiting());