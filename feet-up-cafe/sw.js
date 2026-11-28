// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-56e40d0e12e1.js');self.addEventListener('install',()=>self.skipWaiting());