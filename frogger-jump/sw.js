// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6056f8f47e41.js');self.addEventListener('install',()=>self.skipWaiting());