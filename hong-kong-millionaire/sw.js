// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1f049e47f3cc.js');self.addEventListener('install',()=>self.skipWaiting());