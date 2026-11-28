// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-98fd022fefc8.js');self.addEventListener('install',()=>self.skipWaiting());