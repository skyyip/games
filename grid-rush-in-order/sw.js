// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-85c9b2ea59eb.js');self.addEventListener('install',()=>self.skipWaiting());