// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0453ce6ab82c.js');self.addEventListener('install',()=>self.skipWaiting());