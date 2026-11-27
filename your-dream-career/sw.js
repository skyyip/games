// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ba4cff794e3e.js');self.addEventListener('install',()=>self.skipWaiting());