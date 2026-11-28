// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7446976b71f1.js');self.addEventListener('install',()=>self.skipWaiting());