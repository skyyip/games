// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-00a8b8efd8f8.js');self.addEventListener('install',()=>self.skipWaiting());