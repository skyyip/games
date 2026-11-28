// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e6ed933effd7.js');self.addEventListener('install',()=>self.skipWaiting());