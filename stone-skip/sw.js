// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-13451e4e7e8e.js');self.addEventListener('install',()=>self.skipWaiting());