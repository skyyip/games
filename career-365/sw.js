// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-18a3c9a77951.js');self.addEventListener('install',()=>self.skipWaiting());