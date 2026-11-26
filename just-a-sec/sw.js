// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f2e5fe009bb0.js');self.addEventListener('install',()=>self.skipWaiting());