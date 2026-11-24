// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3a7a7aacedd6.js');self.addEventListener('install',()=>self.skipWaiting());