// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8686feaa0e36.js');self.addEventListener('install',()=>self.skipWaiting());