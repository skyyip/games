// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2a98393b5032.js');self.addEventListener('install',()=>self.skipWaiting());