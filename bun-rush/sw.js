// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f45e8373450c.js');self.addEventListener('install',()=>self.skipWaiting());