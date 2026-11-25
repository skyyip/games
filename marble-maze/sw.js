// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-38daa67b1f87.js');self.addEventListener('install',()=>self.skipWaiting());