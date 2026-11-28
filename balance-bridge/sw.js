// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0c11952efc3d.js');self.addEventListener('install',()=>self.skipWaiting());