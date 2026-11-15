// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-118bc5a4b23f.js');self.addEventListener('install',()=>self.skipWaiting());