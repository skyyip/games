// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-19e8a7791b42.js');self.addEventListener('install',()=>self.skipWaiting());