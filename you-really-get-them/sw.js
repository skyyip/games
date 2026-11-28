// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-66c04b5e1fb1.js');self.addEventListener('install',()=>self.skipWaiting());