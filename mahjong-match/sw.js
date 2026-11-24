// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-266af5ced5f5.js');self.addEventListener('install',()=>self.skipWaiting());