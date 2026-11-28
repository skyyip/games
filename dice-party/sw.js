// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2dec40fb997f.js');self.addEventListener('install',()=>self.skipWaiting());