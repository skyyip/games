// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-38ac5b96f682.js');self.addEventListener('install',()=>self.skipWaiting());