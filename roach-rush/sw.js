// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3ae346cfd8b4.js');self.addEventListener('install',()=>self.skipWaiting());