// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e58948d03dcb.js');self.addEventListener('install',()=>self.skipWaiting());