// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1dbe5da6bf00.js');self.addEventListener('install',()=>self.skipWaiting());