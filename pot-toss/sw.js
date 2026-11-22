// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5da10b7b187c.js');self.addEventListener('install',()=>self.skipWaiting());