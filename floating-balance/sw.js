// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-00c4fe8e30d7.js');self.addEventListener('install',()=>self.skipWaiting());