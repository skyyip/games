// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6add30118ed5.js');self.addEventListener('install',()=>self.skipWaiting());