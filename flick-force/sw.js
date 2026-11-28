// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ce9d8050ca12.js');self.addEventListener('install',()=>self.skipWaiting());