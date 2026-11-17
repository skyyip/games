// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d36079e7690d.js');self.addEventListener('install',()=>self.skipWaiting());