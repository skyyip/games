// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d807b77bc4da.js');self.addEventListener('install',()=>self.skipWaiting());