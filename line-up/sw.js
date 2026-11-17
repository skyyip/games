// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-410cfc28315d.js');self.addEventListener('install',()=>self.skipWaiting());