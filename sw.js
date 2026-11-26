// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-406a03461835.js');self.addEventListener('install',()=>self.skipWaiting());