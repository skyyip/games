// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d5f9dbb545ff.js');self.addEventListener('install',()=>self.skipWaiting());