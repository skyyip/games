// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-574f58ca58b0.js');self.addEventListener('install',()=>self.skipWaiting());