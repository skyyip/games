// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ee4238633a2c.js');self.addEventListener('install',()=>self.skipWaiting());