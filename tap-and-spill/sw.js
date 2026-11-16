// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0b3bfbe4a216.js');self.addEventListener('install',()=>self.skipWaiting());