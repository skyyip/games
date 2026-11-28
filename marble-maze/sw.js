// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-350290f95f53.js');self.addEventListener('install',()=>self.skipWaiting());