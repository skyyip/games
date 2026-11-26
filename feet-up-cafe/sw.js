// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-211646d0c57d.js');self.addEventListener('install',()=>self.skipWaiting());