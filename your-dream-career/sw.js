// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-25afc53c5e7e.js');self.addEventListener('install',()=>self.skipWaiting());