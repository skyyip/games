// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-93c5f6292569.js');self.addEventListener('install',()=>self.skipWaiting());