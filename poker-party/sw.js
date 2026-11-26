// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4fb659486c9f.js');self.addEventListener('install',()=>self.skipWaiting());