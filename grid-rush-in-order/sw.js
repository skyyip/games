// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-80835910646d.js');self.addEventListener('install',()=>self.skipWaiting());