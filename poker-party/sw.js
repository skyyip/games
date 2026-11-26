// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5851cd946c95.js');self.addEventListener('install',()=>self.skipWaiting());