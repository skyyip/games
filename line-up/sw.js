// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e83072067b16.js');self.addEventListener('install',()=>self.skipWaiting());