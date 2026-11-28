// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5c0b0552198f.js');self.addEventListener('install',()=>self.skipWaiting());