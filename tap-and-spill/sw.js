// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3ca0b3b63b02.js');self.addEventListener('install',()=>self.skipWaiting());