// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1307a0558a78.js');self.addEventListener('install',()=>self.skipWaiting());