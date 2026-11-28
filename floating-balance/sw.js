// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d811ca5f8b89.js');self.addEventListener('install',()=>self.skipWaiting());