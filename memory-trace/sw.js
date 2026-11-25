// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d91e9beefb91.js');self.addEventListener('install',()=>self.skipWaiting());