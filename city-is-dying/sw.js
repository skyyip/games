// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-751b69318c77.js');self.addEventListener('install',()=>self.skipWaiting());