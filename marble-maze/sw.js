// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7274ceaaa18c.js');self.addEventListener('install',()=>self.skipWaiting());