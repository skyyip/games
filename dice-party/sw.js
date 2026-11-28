// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9677c3a999a0.js');self.addEventListener('install',()=>self.skipWaiting());