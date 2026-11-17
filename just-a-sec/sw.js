// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-89fcddfc47b9.js');self.addEventListener('install',()=>self.skipWaiting());