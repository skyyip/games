// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f8d63818589b.js');self.addEventListener('install',()=>self.skipWaiting());