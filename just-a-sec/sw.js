// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-83e10c6602a9.js');self.addEventListener('install',()=>self.skipWaiting());