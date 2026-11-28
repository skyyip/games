// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4c9702ff9c59.js');self.addEventListener('install',()=>self.skipWaiting());