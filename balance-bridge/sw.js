// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-804ff069a5d2.js');self.addEventListener('install',()=>self.skipWaiting());