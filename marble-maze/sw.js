// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-700d2b8152d7.js');self.addEventListener('install',()=>self.skipWaiting());