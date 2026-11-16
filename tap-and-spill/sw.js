// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-40a05d468954.js');self.addEventListener('install',()=>self.skipWaiting());