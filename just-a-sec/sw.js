// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5f1b15a92a3d.js');self.addEventListener('install',()=>self.skipWaiting());