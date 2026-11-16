// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b2c3145ec1e4.js');self.addEventListener('install',()=>self.skipWaiting());