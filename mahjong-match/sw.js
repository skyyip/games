// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6a09ad7ccac7.js');self.addEventListener('install',()=>self.skipWaiting());