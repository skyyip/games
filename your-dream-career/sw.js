// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3392350a0f54.js');self.addEventListener('install',()=>self.skipWaiting());