// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-88410bef992b.js');self.addEventListener('install',()=>self.skipWaiting());