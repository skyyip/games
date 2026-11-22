// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1afb4f4df3b9.js');self.addEventListener('install',()=>self.skipWaiting());