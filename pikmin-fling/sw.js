// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1a632ce86903.js');self.addEventListener('install',()=>self.skipWaiting());