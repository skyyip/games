// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4b0d9819b730.js');self.addEventListener('install',()=>self.skipWaiting());