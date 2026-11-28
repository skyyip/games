// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1614b29cf5a8.js');self.addEventListener('install',()=>self.skipWaiting());