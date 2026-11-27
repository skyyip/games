// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8cc8f7876705.js');self.addEventListener('install',()=>self.skipWaiting());