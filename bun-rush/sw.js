// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4992cfb226b0.js');self.addEventListener('install',()=>self.skipWaiting());