// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8e2e069e620a.js');self.addEventListener('install',()=>self.skipWaiting());