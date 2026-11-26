// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-72b15be4bf8b.js');self.addEventListener('install',()=>self.skipWaiting());