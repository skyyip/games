// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-80572ecd6f3d.js');self.addEventListener('install',()=>self.skipWaiting());