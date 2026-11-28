// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-10ea37055634.js');self.addEventListener('install',()=>self.skipWaiting());