// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4e4a95be1b85.js');self.addEventListener('install',()=>self.skipWaiting());