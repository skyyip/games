// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-48606e835528.js');self.addEventListener('install',()=>self.skipWaiting());