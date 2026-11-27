// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-315123f4f74a.js');self.addEventListener('install',()=>self.skipWaiting());