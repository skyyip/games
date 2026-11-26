// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0e6c489ec8f9.js');self.addEventListener('install',()=>self.skipWaiting());