// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-49b5a6bf8c63.js');self.addEventListener('install',()=>self.skipWaiting());