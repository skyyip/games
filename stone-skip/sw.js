// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6cda2c469d91.js');self.addEventListener('install',()=>self.skipWaiting());