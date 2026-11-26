// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ba37d3f8fc8f.js');self.addEventListener('install',()=>self.skipWaiting());