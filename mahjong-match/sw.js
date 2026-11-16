// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0b44466dd50d.js');self.addEventListener('install',()=>self.skipWaiting());