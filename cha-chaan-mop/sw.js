// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-57cab41880ae.js');self.addEventListener('install',()=>self.skipWaiting());