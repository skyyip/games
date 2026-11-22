// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5de6e893d78a.js');self.addEventListener('install',()=>self.skipWaiting());