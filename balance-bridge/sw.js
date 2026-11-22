// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2306661d86f2.js');self.addEventListener('install',()=>self.skipWaiting());