// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ec1d9755b3ba.js');self.addEventListener('install',()=>self.skipWaiting());