// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6e381c37f5cc.js');self.addEventListener('install',()=>self.skipWaiting());