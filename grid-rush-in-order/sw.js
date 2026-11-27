// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6ed1f5929eb5.js');self.addEventListener('install',()=>self.skipWaiting());