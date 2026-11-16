// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-db875793967a.js');self.addEventListener('install',()=>self.skipWaiting());