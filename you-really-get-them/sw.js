// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9470a0a2e10e.js');self.addEventListener('install',()=>self.skipWaiting());