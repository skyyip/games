// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6b922673c91b.js');self.addEventListener('install',()=>self.skipWaiting());