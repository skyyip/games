// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-81861dff7ff7.js');self.addEventListener('install',()=>self.skipWaiting());