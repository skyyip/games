// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-851d8f00d55b.js');self.addEventListener('install',()=>self.skipWaiting());