// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-16f585b38634.js');self.addEventListener('install',()=>self.skipWaiting());