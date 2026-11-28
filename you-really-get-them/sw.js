// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-36c702314619.js');self.addEventListener('install',()=>self.skipWaiting());