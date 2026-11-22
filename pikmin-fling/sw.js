// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-635f65ff6e2d.js');self.addEventListener('install',()=>self.skipWaiting());