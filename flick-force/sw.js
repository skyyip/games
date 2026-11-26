// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-386137410fe5.js');self.addEventListener('install',()=>self.skipWaiting());