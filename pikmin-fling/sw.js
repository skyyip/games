// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5ba4ea5cd64a.js');self.addEventListener('install',()=>self.skipWaiting());