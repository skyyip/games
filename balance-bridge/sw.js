// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ef78032c41f4.js');self.addEventListener('install',()=>self.skipWaiting());