// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-89cf2827563f.js');self.addEventListener('install',()=>self.skipWaiting());