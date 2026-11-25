// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-aa2424a38be2.js');self.addEventListener('install',()=>self.skipWaiting());