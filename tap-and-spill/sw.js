// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-bef375a821e8.js');self.addEventListener('install',()=>self.skipWaiting());