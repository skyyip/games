// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6de3d995b9c1.js');self.addEventListener('install',()=>self.skipWaiting());