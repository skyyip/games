// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-062e1dd012ee.js');self.addEventListener('install',()=>self.skipWaiting());