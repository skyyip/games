// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8002cd0827b0.js');self.addEventListener('install',()=>self.skipWaiting());