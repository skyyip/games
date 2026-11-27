// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-93b069a1330f.js');self.addEventListener('install',()=>self.skipWaiting());