// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1d3163ed4aa1.js');self.addEventListener('install',()=>self.skipWaiting());