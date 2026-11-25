// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-14ab4a359000.js');self.addEventListener('install',()=>self.skipWaiting());