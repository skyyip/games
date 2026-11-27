// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-085356029858.js');self.addEventListener('install',()=>self.skipWaiting());