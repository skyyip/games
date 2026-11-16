// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3c64acb2ee39.js');self.addEventListener('install',()=>self.skipWaiting());