// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2a8a35e7a92e.js');self.addEventListener('install',()=>self.skipWaiting());