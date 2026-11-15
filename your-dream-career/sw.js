// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d50cc30db42a.js');self.addEventListener('install',()=>self.skipWaiting());