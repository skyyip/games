// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5b890d3f2b82.js');self.addEventListener('install',()=>self.skipWaiting());