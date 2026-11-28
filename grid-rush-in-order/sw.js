// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3f779a272887.js');self.addEventListener('install',()=>self.skipWaiting());