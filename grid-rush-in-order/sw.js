// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d246d1f7b31c.js');self.addEventListener('install',()=>self.skipWaiting());