// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-378c4d0874c5.js');self.addEventListener('install',()=>self.skipWaiting());