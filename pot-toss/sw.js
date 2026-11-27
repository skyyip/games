// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1ad498ab85bd.js');self.addEventListener('install',()=>self.skipWaiting());