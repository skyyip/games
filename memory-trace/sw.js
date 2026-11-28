// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-378f166f5221.js');self.addEventListener('install',()=>self.skipWaiting());