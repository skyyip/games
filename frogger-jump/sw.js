// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-88a6afef7d29.js');self.addEventListener('install',()=>self.skipWaiting());