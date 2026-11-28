// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1425c7d4b41c.js');self.addEventListener('install',()=>self.skipWaiting());