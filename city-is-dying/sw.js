// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-fd3c14172a58.js');self.addEventListener('install',()=>self.skipWaiting());