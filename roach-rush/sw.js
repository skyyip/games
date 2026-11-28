// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-444f2d21eb05.js');self.addEventListener('install',()=>self.skipWaiting());