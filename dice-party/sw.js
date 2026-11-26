// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-c09c043a10ba.js');self.addEventListener('install',()=>self.skipWaiting());