// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5a5012ef22c8.js');self.addEventListener('install',()=>self.skipWaiting());