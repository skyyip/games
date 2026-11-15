// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3f8be9ad8060.js');self.addEventListener('install',()=>self.skipWaiting());