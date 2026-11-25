// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-af3a017fa42b.js');self.addEventListener('install',()=>self.skipWaiting());