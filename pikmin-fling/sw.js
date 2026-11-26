// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-70ea05a92f49.js');self.addEventListener('install',()=>self.skipWaiting());