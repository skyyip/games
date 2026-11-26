// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3c153e3ca3e6.js');self.addEventListener('install',()=>self.skipWaiting());