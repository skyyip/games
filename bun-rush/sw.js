// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7a9401d75be3.js');self.addEventListener('install',()=>self.skipWaiting());