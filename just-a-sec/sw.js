// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6cd7ada2cd6d.js');self.addEventListener('install',()=>self.skipWaiting());