// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-55533a4ad75b.js');self.addEventListener('install',()=>self.skipWaiting());