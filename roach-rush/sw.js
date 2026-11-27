// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-62c58e26fe78.js');self.addEventListener('install',()=>self.skipWaiting());