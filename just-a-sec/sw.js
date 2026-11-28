// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-74f01499cff5.js');self.addEventListener('install',()=>self.skipWaiting());