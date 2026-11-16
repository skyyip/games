// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b21d065a24d8.js');self.addEventListener('install',()=>self.skipWaiting());