// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-87d0f2262edf.js');self.addEventListener('install',()=>self.skipWaiting());