// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-283f78809ee6.js');self.addEventListener('install',()=>self.skipWaiting());