// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2a5864d0c02b.js');self.addEventListener('install',()=>self.skipWaiting());