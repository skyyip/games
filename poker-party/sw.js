// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-46fd34dc6164.js');self.addEventListener('install',()=>self.skipWaiting());