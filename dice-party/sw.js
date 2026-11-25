// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-c3bc1a28b21c.js');self.addEventListener('install',()=>self.skipWaiting());