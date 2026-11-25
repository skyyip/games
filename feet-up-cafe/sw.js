// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-cae5406ebdc3.js');self.addEventListener('install',()=>self.skipWaiting());