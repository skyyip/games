// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-29d1c7fc5708.js');self.addEventListener('install',()=>self.skipWaiting());