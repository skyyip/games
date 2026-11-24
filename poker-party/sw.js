// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-04167673f5cf.js');self.addEventListener('install',()=>self.skipWaiting());