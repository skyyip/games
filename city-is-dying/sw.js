// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b7e50d7454dd.js');self.addEventListener('install',()=>self.skipWaiting());