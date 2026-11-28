// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9610c704f21d.js');self.addEventListener('install',()=>self.skipWaiting());