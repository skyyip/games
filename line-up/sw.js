// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0ab03eb173b4.js');self.addEventListener('install',()=>self.skipWaiting());