// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6d373cd6b27b.js');self.addEventListener('install',()=>self.skipWaiting());