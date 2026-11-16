// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7196ee954ab3.js');self.addEventListener('install',()=>self.skipWaiting());