// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2f6fc0307876.js');self.addEventListener('install',()=>self.skipWaiting());