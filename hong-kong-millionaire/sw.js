// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-95190af9fcce.js');self.addEventListener('install',()=>self.skipWaiting());