// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2e7192372dde.js');self.addEventListener('install',()=>self.skipWaiting());