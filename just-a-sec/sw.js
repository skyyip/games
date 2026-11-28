// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-40f2135f8dba.js');self.addEventListener('install',()=>self.skipWaiting());