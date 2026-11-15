// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3f3d6a70f27f.js');self.addEventListener('install',()=>self.skipWaiting());