// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-01b3a8704bd3.js');self.addEventListener('install',()=>self.skipWaiting());