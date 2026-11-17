// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-01b315732368.js');self.addEventListener('install',()=>self.skipWaiting());