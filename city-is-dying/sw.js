// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f72eba0629bb.js');self.addEventListener('install',()=>self.skipWaiting());