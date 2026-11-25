// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-86beec33929f.js');self.addEventListener('install',()=>self.skipWaiting());