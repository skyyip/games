// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b50032b514b2.js');self.addEventListener('install',()=>self.skipWaiting());