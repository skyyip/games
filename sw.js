// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f24c16d81fd1.js');self.addEventListener('install',()=>self.skipWaiting());