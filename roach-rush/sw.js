// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2a8dfbf2969b.js');self.addEventListener('install',()=>self.skipWaiting());