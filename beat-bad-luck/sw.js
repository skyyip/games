// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6d3f86ceb10c.js');self.addEventListener('install',()=>self.skipWaiting());