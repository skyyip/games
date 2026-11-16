// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-33a6219f0547.js');self.addEventListener('install',()=>self.skipWaiting());