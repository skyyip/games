// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1b5aff6fae7f.js');self.addEventListener('install',()=>self.skipWaiting());