// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-386e25608ab2.js');self.addEventListener('install',()=>self.skipWaiting());