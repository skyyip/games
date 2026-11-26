// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8c4e89eb9962.js');self.addEventListener('install',()=>self.skipWaiting());