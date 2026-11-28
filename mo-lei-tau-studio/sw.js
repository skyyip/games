// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7330999df52a.js');self.addEventListener('install',()=>self.skipWaiting());