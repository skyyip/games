// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b31b30879185.js');self.addEventListener('install',()=>self.skipWaiting());