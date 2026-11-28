// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d353b78549ab.js');self.addEventListener('install',()=>self.skipWaiting());