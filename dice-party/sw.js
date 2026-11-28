// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f31e3dbd5152.js');self.addEventListener('install',()=>self.skipWaiting());