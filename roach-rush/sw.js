// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-921253296a13.js');self.addEventListener('install',()=>self.skipWaiting());