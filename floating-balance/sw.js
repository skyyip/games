// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-993d6d5d8167.js');self.addEventListener('install',()=>self.skipWaiting());