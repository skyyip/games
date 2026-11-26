// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-31ea83c823b5.js');self.addEventListener('install',()=>self.skipWaiting());