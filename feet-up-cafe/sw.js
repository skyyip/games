// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-83d1f29bf96d.js');self.addEventListener('install',()=>self.skipWaiting());