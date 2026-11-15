// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2cd9e220a2ee.js');self.addEventListener('install',()=>self.skipWaiting());