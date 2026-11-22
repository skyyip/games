// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-271bcd2f2ea5.js');self.addEventListener('install',()=>self.skipWaiting());