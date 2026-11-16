// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-deed56d84af1.js');self.addEventListener('install',()=>self.skipWaiting());