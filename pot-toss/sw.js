// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-73c03cb4b761.js');self.addEventListener('install',()=>self.skipWaiting());