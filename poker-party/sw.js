// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-29237d24c4dc.js');self.addEventListener('install',()=>self.skipWaiting());