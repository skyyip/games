// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-30c82d2f3763.js');self.addEventListener('install',()=>self.skipWaiting());