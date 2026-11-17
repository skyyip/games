// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8a1fcdc9140c.js');self.addEventListener('install',()=>self.skipWaiting());