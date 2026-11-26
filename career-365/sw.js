// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ac14253fc54b.js');self.addEventListener('install',()=>self.skipWaiting());