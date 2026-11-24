// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-070e69f6a6c4.js');self.addEventListener('install',()=>self.skipWaiting());