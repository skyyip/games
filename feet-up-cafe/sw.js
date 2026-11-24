// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d622957b1c4d.js');self.addEventListener('install',()=>self.skipWaiting());