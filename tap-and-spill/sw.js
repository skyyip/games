// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0c0c70540d88.js');self.addEventListener('install',()=>self.skipWaiting());