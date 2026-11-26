// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7dc7d290f482.js');self.addEventListener('install',()=>self.skipWaiting());