// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2a35170a718d.js');self.addEventListener('install',()=>self.skipWaiting());