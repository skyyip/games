// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-939a7e03dc79.js');self.addEventListener('install',()=>self.skipWaiting());