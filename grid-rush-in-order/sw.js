// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-031f05a68272.js');self.addEventListener('install',()=>self.skipWaiting());