// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-596dc5464c61.js');self.addEventListener('install',()=>self.skipWaiting());