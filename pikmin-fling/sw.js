// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6c2db757b0e6.js');self.addEventListener('install',()=>self.skipWaiting());