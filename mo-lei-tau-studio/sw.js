// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-68730612a35b.js');self.addEventListener('install',()=>self.skipWaiting());