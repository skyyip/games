// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5f8d88b3868c.js');self.addEventListener('install',()=>self.skipWaiting());