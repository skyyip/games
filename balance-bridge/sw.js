// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-935421c19c99.js');self.addEventListener('install',()=>self.skipWaiting());