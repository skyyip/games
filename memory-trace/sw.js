// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-147f8e1a65e8.js');self.addEventListener('install',()=>self.skipWaiting());