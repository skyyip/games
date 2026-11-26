// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-30ba5c42c898.js');self.addEventListener('install',()=>self.skipWaiting());