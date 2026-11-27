// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-373c669a4695.js');self.addEventListener('install',()=>self.skipWaiting());