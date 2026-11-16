// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-57ec9993387e.js');self.addEventListener('install',()=>self.skipWaiting());