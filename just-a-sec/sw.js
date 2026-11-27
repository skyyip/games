// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5f5cc7ad8455.js');self.addEventListener('install',()=>self.skipWaiting());