// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1ebae0677291.js');self.addEventListener('install',()=>self.skipWaiting());