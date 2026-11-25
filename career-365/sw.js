// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-251d24af59c6.js');self.addEventListener('install',()=>self.skipWaiting());