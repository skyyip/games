// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1d108d705628.js');self.addEventListener('install',()=>self.skipWaiting());