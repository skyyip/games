// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-486be17ad22d.js');self.addEventListener('install',()=>self.skipWaiting());