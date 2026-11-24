// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e31c08680b70.js');self.addEventListener('install',()=>self.skipWaiting());