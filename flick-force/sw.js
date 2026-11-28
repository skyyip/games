// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-01bcce2ab923.js');self.addEventListener('install',()=>self.skipWaiting());