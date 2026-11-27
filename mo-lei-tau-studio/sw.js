// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-98a489455f9a.js');self.addEventListener('install',()=>self.skipWaiting());