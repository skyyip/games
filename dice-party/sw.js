// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-fa6bceece3d3.js');self.addEventListener('install',()=>self.skipWaiting());