// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7d1a29a66afd.js');self.addEventListener('install',()=>self.skipWaiting());