// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b8b313ee3737.js');self.addEventListener('install',()=>self.skipWaiting());