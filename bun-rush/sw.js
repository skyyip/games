// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8f4587e80e2e.js');self.addEventListener('install',()=>self.skipWaiting());