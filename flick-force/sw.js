// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d478afef20b2.js');self.addEventListener('install',()=>self.skipWaiting());