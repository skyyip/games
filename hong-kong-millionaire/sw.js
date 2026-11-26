// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-84a3413c8993.js');self.addEventListener('install',()=>self.skipWaiting());