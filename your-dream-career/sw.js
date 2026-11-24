// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0e44c15accc4.js');self.addEventListener('install',()=>self.skipWaiting());