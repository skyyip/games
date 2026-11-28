// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-51023c3a89c4.js');self.addEventListener('install',()=>self.skipWaiting());