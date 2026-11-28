// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-eaeeb94c30ca.js');self.addEventListener('install',()=>self.skipWaiting());