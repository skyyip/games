// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-668940df2d18.js');self.addEventListener('install',()=>self.skipWaiting());