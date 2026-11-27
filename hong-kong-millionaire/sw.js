// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-77e9b663ac7b.js');self.addEventListener('install',()=>self.skipWaiting());