// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-92629ca5eb9d.js');self.addEventListener('install',()=>self.skipWaiting());