// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0a82e4570847.js');self.addEventListener('install',()=>self.skipWaiting());