// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-10ea9099e42d.js');self.addEventListener('install',()=>self.skipWaiting());