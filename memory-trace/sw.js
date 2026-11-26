// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6b9ab9f8f5c7.js');self.addEventListener('install',()=>self.skipWaiting());