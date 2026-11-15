// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8617fce72e79.js');self.addEventListener('install',()=>self.skipWaiting());