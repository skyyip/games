// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6bce419f00b7.js');self.addEventListener('install',()=>self.skipWaiting());