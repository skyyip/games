// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2378646d2bf8.js');self.addEventListener('install',()=>self.skipWaiting());