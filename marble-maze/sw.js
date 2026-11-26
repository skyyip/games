// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9bad2d73e2d0.js');self.addEventListener('install',()=>self.skipWaiting());