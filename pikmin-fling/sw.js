// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2d436b6b58a1.js');self.addEventListener('install',()=>self.skipWaiting());