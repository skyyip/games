// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3e3adaf7ec5a.js');self.addEventListener('install',()=>self.skipWaiting());