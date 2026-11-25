// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5d563ba6b058.js');self.addEventListener('install',()=>self.skipWaiting());