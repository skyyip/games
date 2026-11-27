// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-03320906d289.js');self.addEventListener('install',()=>self.skipWaiting());