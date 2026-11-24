// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b2e8973a9fcf.js');self.addEventListener('install',()=>self.skipWaiting());