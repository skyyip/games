// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9383583b5735.js');self.addEventListener('install',()=>self.skipWaiting());