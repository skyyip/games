// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9b834f4c2cff.js');self.addEventListener('install',()=>self.skipWaiting());