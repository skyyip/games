// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9a03470e04d4.js');self.addEventListener('install',()=>self.skipWaiting());