// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8f8a3f63fca5.js');self.addEventListener('install',()=>self.skipWaiting());