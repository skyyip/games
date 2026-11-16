// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7d59993c65c2.js');self.addEventListener('install',()=>self.skipWaiting());