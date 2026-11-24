// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4cdf3566c8b8.js');self.addEventListener('install',()=>self.skipWaiting());