// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0027d6c12c6e.js');self.addEventListener('install',()=>self.skipWaiting());