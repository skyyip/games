// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-85cb57995f4e.js');self.addEventListener('install',()=>self.skipWaiting());