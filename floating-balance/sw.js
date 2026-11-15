// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f31a90e17400.js');self.addEventListener('install',()=>self.skipWaiting());