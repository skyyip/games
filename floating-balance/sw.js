// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ee97972f7b77.js');self.addEventListener('install',()=>self.skipWaiting());