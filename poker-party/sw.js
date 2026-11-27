// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5a65e9945c60.js');self.addEventListener('install',()=>self.skipWaiting());