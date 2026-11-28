// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8d4996384f3a.js');self.addEventListener('install',()=>self.skipWaiting());