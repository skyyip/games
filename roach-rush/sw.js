// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-bfa23564c20c.js');self.addEventListener('install',()=>self.skipWaiting());