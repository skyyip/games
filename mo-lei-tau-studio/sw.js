// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-19fcb31454fb.js');self.addEventListener('install',()=>self.skipWaiting());