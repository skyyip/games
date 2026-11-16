// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-13c3c323f7be.js');self.addEventListener('install',()=>self.skipWaiting());