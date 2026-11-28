// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0e3813221b3f.js');self.addEventListener('install',()=>self.skipWaiting());