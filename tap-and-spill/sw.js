// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-16c232d942e4.js');self.addEventListener('install',()=>self.skipWaiting());