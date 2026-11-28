// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f52fe00454f1.js');self.addEventListener('install',()=>self.skipWaiting());