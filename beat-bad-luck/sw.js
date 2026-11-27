// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-487d0076d9ec.js');self.addEventListener('install',()=>self.skipWaiting());