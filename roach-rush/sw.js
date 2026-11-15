// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1cbdd236cd16.js');self.addEventListener('install',()=>self.skipWaiting());