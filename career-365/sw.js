// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-52720a8c1cf8.js');self.addEventListener('install',()=>self.skipWaiting());