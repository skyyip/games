// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2717b6b87087.js');self.addEventListener('install',()=>self.skipWaiting());