// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5058f249cc2c.js');self.addEventListener('install',()=>self.skipWaiting());