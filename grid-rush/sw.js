// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8d4762eecf80.js');self.addEventListener('install',()=>self.skipWaiting());