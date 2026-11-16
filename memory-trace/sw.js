// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7d742d528a42.js');self.addEventListener('install',()=>self.skipWaiting());