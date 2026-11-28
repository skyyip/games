// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f0fee360dfb9.js');self.addEventListener('install',()=>self.skipWaiting());