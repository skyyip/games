// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-416c6c965717.js');self.addEventListener('install',()=>self.skipWaiting());