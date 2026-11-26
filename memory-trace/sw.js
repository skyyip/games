// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-51e3d587f26a.js');self.addEventListener('install',()=>self.skipWaiting());