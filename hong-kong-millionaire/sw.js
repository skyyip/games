// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0b74e2b471eb.js');self.addEventListener('install',()=>self.skipWaiting());