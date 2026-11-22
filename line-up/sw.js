// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-81c45d98cfd1.js');self.addEventListener('install',()=>self.skipWaiting());