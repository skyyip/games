// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7eafe04c6e5f.js');self.addEventListener('install',()=>self.skipWaiting());