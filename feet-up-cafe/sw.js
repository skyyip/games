// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-60d6bda2522a.js');self.addEventListener('install',()=>self.skipWaiting());