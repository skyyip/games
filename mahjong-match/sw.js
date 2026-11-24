// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-57882e9634b6.js');self.addEventListener('install',()=>self.skipWaiting());