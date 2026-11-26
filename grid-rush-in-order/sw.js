// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f43da224367a.js');self.addEventListener('install',()=>self.skipWaiting());