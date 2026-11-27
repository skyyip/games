// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-041f9d161ab6.js');self.addEventListener('install',()=>self.skipWaiting());