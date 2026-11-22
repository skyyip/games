// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-85c52d14105d.js');self.addEventListener('install',()=>self.skipWaiting());