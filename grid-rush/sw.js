// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8da4f1207599.js');self.addEventListener('install',()=>self.skipWaiting());