// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d2214abd7cb9.js');self.addEventListener('install',()=>self.skipWaiting());