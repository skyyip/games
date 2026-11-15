// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9ac7f73bb1a2.js');self.addEventListener('install',()=>self.skipWaiting());