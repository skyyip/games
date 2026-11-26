// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-c74751f037db.js');self.addEventListener('install',()=>self.skipWaiting());