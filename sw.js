// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-57ed7589e1e8.js');self.addEventListener('install',()=>self.skipWaiting());