// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f3a3ea570051.js');self.addEventListener('install',()=>self.skipWaiting());