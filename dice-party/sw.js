// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5a24a72b3945.js');self.addEventListener('install',()=>self.skipWaiting());