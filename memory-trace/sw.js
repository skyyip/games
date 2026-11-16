// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-942781ee1329.js');self.addEventListener('install',()=>self.skipWaiting());