// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-712a1775afeb.js');self.addEventListener('install',()=>self.skipWaiting());