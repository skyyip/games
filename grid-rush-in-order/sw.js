// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9e159c1beea8.js');self.addEventListener('install',()=>self.skipWaiting());