// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-06fc15293b35.js');self.addEventListener('install',()=>self.skipWaiting());