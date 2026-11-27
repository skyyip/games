// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-fe72fb5d1c27.js');self.addEventListener('install',()=>self.skipWaiting());