// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e7e321746596.js');self.addEventListener('install',()=>self.skipWaiting());