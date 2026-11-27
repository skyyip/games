// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6d3e4ea25f33.js');self.addEventListener('install',()=>self.skipWaiting());