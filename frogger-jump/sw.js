// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8b87124b57c1.js');self.addEventListener('install',()=>self.skipWaiting());