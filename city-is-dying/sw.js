// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7fed05ec4645.js');self.addEventListener('install',()=>self.skipWaiting());