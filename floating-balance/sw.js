// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-95545bfa014c.js');self.addEventListener('install',()=>self.skipWaiting());