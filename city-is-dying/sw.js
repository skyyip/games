// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-94f7a2e3615a.js');self.addEventListener('install',()=>self.skipWaiting());