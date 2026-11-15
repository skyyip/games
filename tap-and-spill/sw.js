// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-436576ec4570.js');self.addEventListener('install',()=>self.skipWaiting());