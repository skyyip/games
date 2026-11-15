// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-28649ebba5f3.js');self.addEventListener('install',()=>self.skipWaiting());