// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5e27ea791f22.js');self.addEventListener('install',()=>self.skipWaiting());