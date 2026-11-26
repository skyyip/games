// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-bb22e180cc88.js');self.addEventListener('install',()=>self.skipWaiting());