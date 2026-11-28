// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f84e3126ed0e.js');self.addEventListener('install',()=>self.skipWaiting());