// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7858b2c1961f.js');self.addEventListener('install',()=>self.skipWaiting());