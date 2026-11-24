// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d1184002ac44.js');self.addEventListener('install',()=>self.skipWaiting());