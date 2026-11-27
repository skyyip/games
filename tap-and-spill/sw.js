// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f26856c4c6bd.js');self.addEventListener('install',()=>self.skipWaiting());