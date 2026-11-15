// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d7985496296a.js');self.addEventListener('install',()=>self.skipWaiting());