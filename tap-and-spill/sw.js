// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-816af7027e3d.js');self.addEventListener('install',()=>self.skipWaiting());