// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-38b68b8422ba.js');self.addEventListener('install',()=>self.skipWaiting());