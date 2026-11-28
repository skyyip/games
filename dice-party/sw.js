// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0e6fa95c1d84.js');self.addEventListener('install',()=>self.skipWaiting());