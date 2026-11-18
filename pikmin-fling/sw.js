// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d871359f6cfa.js');self.addEventListener('install',()=>self.skipWaiting());