// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d7d55657cd39.js');self.addEventListener('install',()=>self.skipWaiting());