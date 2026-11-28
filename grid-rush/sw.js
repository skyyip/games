// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e25db185f9a1.js');self.addEventListener('install',()=>self.skipWaiting());