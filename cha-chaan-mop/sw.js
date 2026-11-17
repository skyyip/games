// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0871e50640d6.js');self.addEventListener('install',()=>self.skipWaiting());