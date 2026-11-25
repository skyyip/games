// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2e44b248f070.js');self.addEventListener('install',()=>self.skipWaiting());