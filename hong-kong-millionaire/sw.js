// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9d9f2749a073.js');self.addEventListener('install',()=>self.skipWaiting());