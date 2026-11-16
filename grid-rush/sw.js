// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2fda5ef7cf8a.js');self.addEventListener('install',()=>self.skipWaiting());