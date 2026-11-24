// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-423b1c4b14c2.js');self.addEventListener('install',()=>self.skipWaiting());