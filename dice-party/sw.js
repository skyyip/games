// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1b74d789f111.js');self.addEventListener('install',()=>self.skipWaiting());