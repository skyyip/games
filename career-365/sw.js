// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-414528edf19b.js');self.addEventListener('install',()=>self.skipWaiting());