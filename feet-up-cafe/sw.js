// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-50708fd01ee1.js');self.addEventListener('install',()=>self.skipWaiting());