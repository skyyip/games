// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-08d044854d80.js');self.addEventListener('install',()=>self.skipWaiting());