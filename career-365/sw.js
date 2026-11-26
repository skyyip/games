// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0f5be1fb0b1a.js');self.addEventListener('install',()=>self.skipWaiting());