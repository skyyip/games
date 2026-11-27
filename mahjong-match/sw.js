// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1b9b5c16ffb4.js');self.addEventListener('install',()=>self.skipWaiting());