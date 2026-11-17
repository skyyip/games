// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-22fdec8bc494.js');self.addEventListener('install',()=>self.skipWaiting());