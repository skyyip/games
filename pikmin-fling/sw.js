// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f19b5b2a9e87.js');self.addEventListener('install',()=>self.skipWaiting());