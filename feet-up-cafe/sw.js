// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-000732b53ce2.js');self.addEventListener('install',()=>self.skipWaiting());