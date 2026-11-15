// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5c428613693f.js');self.addEventListener('install',()=>self.skipWaiting());