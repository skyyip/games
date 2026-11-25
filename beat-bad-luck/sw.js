// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-69b0b09ea836.js');self.addEventListener('install',()=>self.skipWaiting());