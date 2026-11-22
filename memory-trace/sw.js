// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9732dde8316c.js');self.addEventListener('install',()=>self.skipWaiting());