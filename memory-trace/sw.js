// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9ed7d3420674.js');self.addEventListener('install',()=>self.skipWaiting());