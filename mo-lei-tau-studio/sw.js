// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-fc400453a04d.js');self.addEventListener('install',()=>self.skipWaiting());