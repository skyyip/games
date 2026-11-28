// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5c1a7146a5a6.js');self.addEventListener('install',()=>self.skipWaiting());