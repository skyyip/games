// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-bbe60abc921f.js');self.addEventListener('install',()=>self.skipWaiting());