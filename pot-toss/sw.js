// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2345450648e7.js');self.addEventListener('install',()=>self.skipWaiting());