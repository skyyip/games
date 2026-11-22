// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3ac652c3e08c.js');self.addEventListener('install',()=>self.skipWaiting());