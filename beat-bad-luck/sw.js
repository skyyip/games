// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6f4f4ce064ad.js');self.addEventListener('install',()=>self.skipWaiting());