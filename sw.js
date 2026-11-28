// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-78750da70f3b.js');self.addEventListener('install',()=>self.skipWaiting());