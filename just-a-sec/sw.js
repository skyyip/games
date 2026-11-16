// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-68dfdfa7e8bd.js');self.addEventListener('install',()=>self.skipWaiting());