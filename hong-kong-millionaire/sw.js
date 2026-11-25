// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-05d9837a3f1c.js');self.addEventListener('install',()=>self.skipWaiting());