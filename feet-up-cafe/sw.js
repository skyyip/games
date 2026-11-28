// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f98e1f664fca.js');self.addEventListener('install',()=>self.skipWaiting());