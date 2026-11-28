// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1168d3498baf.js');self.addEventListener('install',()=>self.skipWaiting());