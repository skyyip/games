// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-06bc4fc1d50e.js');self.addEventListener('install',()=>self.skipWaiting());