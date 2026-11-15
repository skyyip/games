// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4740f40b581e.js');self.addEventListener('install',()=>self.skipWaiting());