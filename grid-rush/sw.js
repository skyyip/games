// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8091edd70628.js');self.addEventListener('install',()=>self.skipWaiting());