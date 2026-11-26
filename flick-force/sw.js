// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9876e1d0cda4.js');self.addEventListener('install',()=>self.skipWaiting());