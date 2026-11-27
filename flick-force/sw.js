// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0b8f0909623e.js');self.addEventListener('install',()=>self.skipWaiting());