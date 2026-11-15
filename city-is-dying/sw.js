// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-03ba32046d95.js');self.addEventListener('install',()=>self.skipWaiting());