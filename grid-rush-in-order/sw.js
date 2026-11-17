// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0d9428b299c8.js');self.addEventListener('install',()=>self.skipWaiting());