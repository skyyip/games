// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ed3de6d7d120.js');self.addEventListener('install',()=>self.skipWaiting());