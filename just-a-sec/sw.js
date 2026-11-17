// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-40551c7a18e3.js');self.addEventListener('install',()=>self.skipWaiting());