// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4e5b5014fb9d.js');self.addEventListener('install',()=>self.skipWaiting());