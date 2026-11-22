// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4f2f9b2a9ebe.js');self.addEventListener('install',()=>self.skipWaiting());