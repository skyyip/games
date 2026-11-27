// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0858e9e5c949.js');self.addEventListener('install',()=>self.skipWaiting());