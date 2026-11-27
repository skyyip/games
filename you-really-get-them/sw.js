// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-694896874539.js');self.addEventListener('install',()=>self.skipWaiting());