// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-61556e2772f0.js');self.addEventListener('install',()=>self.skipWaiting());