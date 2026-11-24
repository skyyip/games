// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1b05e606f368.js');self.addEventListener('install',()=>self.skipWaiting());