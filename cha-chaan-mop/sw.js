// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1a27de679f49.js');self.addEventListener('install',()=>self.skipWaiting());