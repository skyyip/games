// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2094771cd34d.js');self.addEventListener('install',()=>self.skipWaiting());