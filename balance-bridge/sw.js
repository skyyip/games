// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1571d178ad16.js');self.addEventListener('install',()=>self.skipWaiting());