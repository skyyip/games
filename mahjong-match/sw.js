// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-36a07dd5ec67.js');self.addEventListener('install',()=>self.skipWaiting());