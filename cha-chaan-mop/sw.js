// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-22282ed9754d.js');self.addEventListener('install',()=>self.skipWaiting());