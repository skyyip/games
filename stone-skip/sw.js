// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-389a95631b53.js');self.addEventListener('install',()=>self.skipWaiting());