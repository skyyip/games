// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-513960c08d64.js');self.addEventListener('install',()=>self.skipWaiting());