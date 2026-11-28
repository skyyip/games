// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2b4507463506.js');self.addEventListener('install',()=>self.skipWaiting());