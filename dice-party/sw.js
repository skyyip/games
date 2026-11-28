// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-36f0362bb570.js');self.addEventListener('install',()=>self.skipWaiting());