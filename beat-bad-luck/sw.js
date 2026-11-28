// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-80b7e506645c.js');self.addEventListener('install',()=>self.skipWaiting());