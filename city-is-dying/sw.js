// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1408da0ad6b0.js');self.addEventListener('install',()=>self.skipWaiting());