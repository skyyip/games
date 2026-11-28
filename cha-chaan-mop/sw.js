// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b90e7af3b6d8.js');self.addEventListener('install',()=>self.skipWaiting());