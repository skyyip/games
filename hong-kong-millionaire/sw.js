// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5e1623b41f36.js');self.addEventListener('install',()=>self.skipWaiting());