// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e4d76cab0601.js');self.addEventListener('install',()=>self.skipWaiting());