// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4aceca964760.js');self.addEventListener('install',()=>self.skipWaiting());