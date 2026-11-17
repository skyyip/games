// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d8e757dc2244.js');self.addEventListener('install',()=>self.skipWaiting());