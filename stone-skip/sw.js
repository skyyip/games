// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b128f87917d6.js');self.addEventListener('install',()=>self.skipWaiting());