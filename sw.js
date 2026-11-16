// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7d9416bcf54c.js');self.addEventListener('install',()=>self.skipWaiting());