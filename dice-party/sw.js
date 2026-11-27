// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7fe5078fab06.js');self.addEventListener('install',()=>self.skipWaiting());