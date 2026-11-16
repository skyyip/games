// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1cec6f3a54a9.js');self.addEventListener('install',()=>self.skipWaiting());