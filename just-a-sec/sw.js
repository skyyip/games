// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-03f158137f8b.js');self.addEventListener('install',()=>self.skipWaiting());