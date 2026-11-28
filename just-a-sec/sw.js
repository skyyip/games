// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7b517f549ff5.js');self.addEventListener('install',()=>self.skipWaiting());