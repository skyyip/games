// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0bc492591025.js');self.addEventListener('install',()=>self.skipWaiting());