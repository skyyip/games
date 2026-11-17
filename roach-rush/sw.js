// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1e463e17be12.js');self.addEventListener('install',()=>self.skipWaiting());