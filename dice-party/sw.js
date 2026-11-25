// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4250398e460e.js');self.addEventListener('install',()=>self.skipWaiting());