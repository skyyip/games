// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-869f0dd4dd23.js');self.addEventListener('install',()=>self.skipWaiting());