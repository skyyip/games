// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-727e647a0db3.js');self.addEventListener('install',()=>self.skipWaiting());