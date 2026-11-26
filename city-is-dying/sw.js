// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1a03be6ce879.js');self.addEventListener('install',()=>self.skipWaiting());