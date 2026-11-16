// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-87e112f6e72b.js');self.addEventListener('install',()=>self.skipWaiting());