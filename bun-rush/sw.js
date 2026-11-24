// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-06794c99bb55.js');self.addEventListener('install',()=>self.skipWaiting());