// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b670d27891d4.js');self.addEventListener('install',()=>self.skipWaiting());