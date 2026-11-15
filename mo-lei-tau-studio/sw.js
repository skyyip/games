// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-821b06e9485e.js');self.addEventListener('install',()=>self.skipWaiting());