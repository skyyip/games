// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-12042671e41e.js');self.addEventListener('install',()=>self.skipWaiting());