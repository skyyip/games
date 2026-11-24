// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d524172ae5c4.js');self.addEventListener('install',()=>self.skipWaiting());