// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8fe8ac6500ea.js');self.addEventListener('install',()=>self.skipWaiting());