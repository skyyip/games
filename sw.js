// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-da242110eb47.js');self.addEventListener('install',()=>self.skipWaiting());