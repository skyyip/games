// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2391204c7eef.js');self.addEventListener('install',()=>self.skipWaiting());