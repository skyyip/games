// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-49c9948bf723.js');self.addEventListener('install',()=>self.skipWaiting());