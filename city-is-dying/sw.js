// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-901a5a105cae.js');self.addEventListener('install',()=>self.skipWaiting());