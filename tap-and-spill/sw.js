// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-57393954fef0.js');self.addEventListener('install',()=>self.skipWaiting());