// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3e1ebc56617b.js');self.addEventListener('install',()=>self.skipWaiting());