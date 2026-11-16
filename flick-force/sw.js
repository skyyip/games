// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3278a72e4b9d.js');self.addEventListener('install',()=>self.skipWaiting());