// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-658ab4ef3598.js');self.addEventListener('install',()=>self.skipWaiting());