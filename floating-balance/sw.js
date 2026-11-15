// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2db97aa0422c.js');self.addEventListener('install',()=>self.skipWaiting());