// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e5172bf45dc6.js');self.addEventListener('install',()=>self.skipWaiting());