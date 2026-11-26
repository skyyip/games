// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4871a20714e3.js');self.addEventListener('install',()=>self.skipWaiting());