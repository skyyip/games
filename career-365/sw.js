// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3815e3f1b753.js');self.addEventListener('install',()=>self.skipWaiting());