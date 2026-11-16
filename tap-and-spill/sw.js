// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-dce092ab335f.js');self.addEventListener('install',()=>self.skipWaiting());