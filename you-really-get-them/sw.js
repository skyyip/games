// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-a0db603cdbfd.js');self.addEventListener('install',()=>self.skipWaiting());