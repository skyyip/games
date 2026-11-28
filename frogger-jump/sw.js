// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-20fff4865170.js');self.addEventListener('install',()=>self.skipWaiting());