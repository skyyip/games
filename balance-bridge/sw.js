// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d5d8499c8908.js');self.addEventListener('install',()=>self.skipWaiting());