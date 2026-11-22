// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-012e4c14bbe1.js');self.addEventListener('install',()=>self.skipWaiting());