// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b7140a6fa75a.js');self.addEventListener('install',()=>self.skipWaiting());