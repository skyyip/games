// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ed9059b02380.js');self.addEventListener('install',()=>self.skipWaiting());