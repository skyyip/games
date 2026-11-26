// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7a265389de96.js');self.addEventListener('install',()=>self.skipWaiting());