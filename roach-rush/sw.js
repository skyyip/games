// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-210b8d1b0cf5.js');self.addEventListener('install',()=>self.skipWaiting());