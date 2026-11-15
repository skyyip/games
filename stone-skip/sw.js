// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d7945165aac0.js');self.addEventListener('install',()=>self.skipWaiting());