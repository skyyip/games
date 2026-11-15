// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0599c90c6c91.js');self.addEventListener('install',()=>self.skipWaiting());