// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5040e5aad72d.js');self.addEventListener('install',()=>self.skipWaiting());