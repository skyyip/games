// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2b3e9b285a34.js');self.addEventListener('install',()=>self.skipWaiting());