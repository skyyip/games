// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-02a964603c3c.js');self.addEventListener('install',()=>self.skipWaiting());