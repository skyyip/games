// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-84cfaf87ea17.js');self.addEventListener('install',()=>self.skipWaiting());