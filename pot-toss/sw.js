// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-57ed6ffe7d6a.js');self.addEventListener('install',()=>self.skipWaiting());