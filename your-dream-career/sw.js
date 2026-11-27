// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1740862cc9ee.js');self.addEventListener('install',()=>self.skipWaiting());