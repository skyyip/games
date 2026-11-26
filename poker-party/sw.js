// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-32497ce7a6a3.js');self.addEventListener('install',()=>self.skipWaiting());