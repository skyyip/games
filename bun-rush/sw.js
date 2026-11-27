// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-bd7f357b7b94.js');self.addEventListener('install',()=>self.skipWaiting());