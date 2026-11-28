// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f61f5907d351.js');self.addEventListener('install',()=>self.skipWaiting());