// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6247fda722cd.js');self.addEventListener('install',()=>self.skipWaiting());