// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-66a84d82cb81.js');self.addEventListener('install',()=>self.skipWaiting());