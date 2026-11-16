// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-525c7402f3cf.js');self.addEventListener('install',()=>self.skipWaiting());