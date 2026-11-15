// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f6f4234ff3eb.js');self.addEventListener('install',()=>self.skipWaiting());