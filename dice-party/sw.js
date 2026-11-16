// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9e21c533b6f7.js');self.addEventListener('install',()=>self.skipWaiting());