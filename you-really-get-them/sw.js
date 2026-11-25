// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2403b98c7d40.js');self.addEventListener('install',()=>self.skipWaiting());