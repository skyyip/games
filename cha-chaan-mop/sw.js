// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f6e0ab794f02.js');self.addEventListener('install',()=>self.skipWaiting());