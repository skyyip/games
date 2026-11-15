// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-bd5db69bd947.js');self.addEventListener('install',()=>self.skipWaiting());