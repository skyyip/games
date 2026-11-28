// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1e4f25a15030.js');self.addEventListener('install',()=>self.skipWaiting());