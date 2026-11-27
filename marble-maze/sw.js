// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-821e3a4e2c93.js');self.addEventListener('install',()=>self.skipWaiting());