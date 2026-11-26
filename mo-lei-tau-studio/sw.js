// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4073913f1c6b.js');self.addEventListener('install',()=>self.skipWaiting());