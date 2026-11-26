// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-938e987650dc.js');self.addEventListener('install',()=>self.skipWaiting());