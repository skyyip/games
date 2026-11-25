// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5a10358b4074.js');self.addEventListener('install',()=>self.skipWaiting());