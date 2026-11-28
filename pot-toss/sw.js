// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-193657cc5f25.js');self.addEventListener('install',()=>self.skipWaiting());