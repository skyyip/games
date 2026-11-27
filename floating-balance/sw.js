// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ab414887d131.js');self.addEventListener('install',()=>self.skipWaiting());