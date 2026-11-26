// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5db78c3417d0.js');self.addEventListener('install',()=>self.skipWaiting());