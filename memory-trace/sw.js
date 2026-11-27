// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-263d179eed0c.js');self.addEventListener('install',()=>self.skipWaiting());