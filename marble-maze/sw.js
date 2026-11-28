// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f8fb7bed3dae.js');self.addEventListener('install',()=>self.skipWaiting());