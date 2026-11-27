// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-33504fa5836b.js');self.addEventListener('install',()=>self.skipWaiting());