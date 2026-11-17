// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0a99132a5a4e.js');self.addEventListener('install',()=>self.skipWaiting());