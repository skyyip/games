// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-70dc9fb94b77.js');self.addEventListener('install',()=>self.skipWaiting());