// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d24c438040dd.js');self.addEventListener('install',()=>self.skipWaiting());