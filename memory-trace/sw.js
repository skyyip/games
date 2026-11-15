// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-152a34c3b3da.js');self.addEventListener('install',()=>self.skipWaiting());