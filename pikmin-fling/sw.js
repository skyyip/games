// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b309adebf467.js');self.addEventListener('install',()=>self.skipWaiting());