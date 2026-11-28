// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9d6904246c47.js');self.addEventListener('install',()=>self.skipWaiting());