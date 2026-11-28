// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-fe41b09244b2.js');self.addEventListener('install',()=>self.skipWaiting());