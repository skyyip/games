// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-72cf485f3b1e.js');self.addEventListener('install',()=>self.skipWaiting());