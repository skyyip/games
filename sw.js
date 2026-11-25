// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-93fee0d822e5.js');self.addEventListener('install',()=>self.skipWaiting());