// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0fb6408fb115.js');self.addEventListener('install',()=>self.skipWaiting());