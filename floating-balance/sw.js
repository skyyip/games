// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-65bcf17b6b4c.js');self.addEventListener('install',()=>self.skipWaiting());