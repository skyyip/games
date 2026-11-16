// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6dffc4c7a05d.js');self.addEventListener('install',()=>self.skipWaiting());