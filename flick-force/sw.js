// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e60cd4a8edf1.js');self.addEventListener('install',()=>self.skipWaiting());