// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-21a3a844cfe8.js');self.addEventListener('install',()=>self.skipWaiting());