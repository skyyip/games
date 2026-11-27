// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-48c581e79bb2.js');self.addEventListener('install',()=>self.skipWaiting());