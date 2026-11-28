// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2c10e04ad75f.js');self.addEventListener('install',()=>self.skipWaiting());