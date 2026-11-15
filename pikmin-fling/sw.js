// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7700bd6fb395.js');self.addEventListener('install',()=>self.skipWaiting());