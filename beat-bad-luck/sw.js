// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8dcf919d5b1d.js');self.addEventListener('install',()=>self.skipWaiting());