// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5fc7a17e3657.js');self.addEventListener('install',()=>self.skipWaiting());