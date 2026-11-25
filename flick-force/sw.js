// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-97b32e4c4af6.js');self.addEventListener('install',()=>self.skipWaiting());