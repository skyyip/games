// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f52aed9f5bc8.js');self.addEventListener('install',()=>self.skipWaiting());