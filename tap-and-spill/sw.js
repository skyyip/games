// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9e0d864166c4.js');self.addEventListener('install',()=>self.skipWaiting());