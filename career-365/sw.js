// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-72dc2ba16fa4.js');self.addEventListener('install',()=>self.skipWaiting());