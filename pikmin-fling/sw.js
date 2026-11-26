// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0aff6f7b6a76.js');self.addEventListener('install',()=>self.skipWaiting());