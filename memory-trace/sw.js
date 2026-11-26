// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-078ae5e79e79.js');self.addEventListener('install',()=>self.skipWaiting());