// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-46b030d521e6.js');self.addEventListener('install',()=>self.skipWaiting());