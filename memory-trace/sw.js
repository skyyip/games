// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d074525172aa.js');self.addEventListener('install',()=>self.skipWaiting());