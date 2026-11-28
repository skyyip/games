// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2173005eea93.js');self.addEventListener('install',()=>self.skipWaiting());