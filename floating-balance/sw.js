// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-74494b9ac325.js');self.addEventListener('install',()=>self.skipWaiting());