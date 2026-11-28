// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-92d3f8413490.js');self.addEventListener('install',()=>self.skipWaiting());