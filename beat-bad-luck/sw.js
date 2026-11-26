// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7c57ff8f44f4.js');self.addEventListener('install',()=>self.skipWaiting());