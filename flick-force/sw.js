// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ba3981b856c3.js');self.addEventListener('install',()=>self.skipWaiting());