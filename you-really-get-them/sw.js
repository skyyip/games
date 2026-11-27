// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-404d9a995dc2.js');self.addEventListener('install',()=>self.skipWaiting());